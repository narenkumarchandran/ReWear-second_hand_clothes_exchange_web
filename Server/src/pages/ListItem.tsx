import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Camera, 
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  Ruler,
  MapPin,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { aiDescriptionService } from '@/services/aiDescriptionService';
import { nsfwService } from '@/services/nsfwService';
import { itemsApi } from '@/services/api';

const ListItem = () => {
  const [images, setImages] = useState<File[]>([]);
  const [imageVerificationStatus, setImageVerificationStatus] = useState<{[key: number]: 'pending' | 'verified' | 'rejected'}>({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ecoPoints, setEcoPoints] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPredictingSize, setIsPredictingSize] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const verifyImage = async (file: File, index: number) => {
    setImageVerificationStatus(prev => ({ ...prev, [index]: 'pending' }));
    
    try {
      const moderationResult = await nsfwService.moderateImage(file);
      
      if (moderationResult.isAppropriate) {
        setImageVerificationStatus(prev => ({ ...prev, [index]: 'verified' }));
        toast.success(`Image passed safety checks (Score: ${moderationResult.nsfwScore.toFixed(2)})`);
      } else {
        setImageVerificationStatus(prev => ({ ...prev, [index]: 'rejected' }));
        toast.error(moderationResult.message || "Image contains inappropriate content");
      }
    } catch (error) {
      console.error('Image verification error:', error);
      // Fail open
      setImageVerificationStatus(prev => ({ ...prev, [index]: 'verified' }));
      toast.info("Unable to verify image right now, but you can proceed.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error("You can upload maximum 5 images");
      return;
    }
    
    const newImages = [...images, ...files];
    setImages(newImages);
    
    for (let i = 0; i < files.length; i++) {
      const imageIndex = images.length + i;
      await verifyImage(files[i], imageIndex);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageVerificationStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[index];
      return newStatus;
    });
  };

  const handleAutoGenerate = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image to generate description");
      return;
    }

    setIsGenerating(true);
    
    try {
      const moderationResult = await nsfwService.moderateImage(images[0]);
      
      if (!moderationResult.isAppropriate) {
        toast.error(moderationResult.message);
        setIsGenerating(false);
        return;
      }

      const result = await aiDescriptionService.generateClothingDescription(images[0]);
      
      if (result) {
        setTitle(result.title);
        setDescription(result.description);
        setCategory(result.category);
        setType(result.type);
        setSize(result.size);
        setCondition(result.condition);
        setColor(result.color || '');
        setBrand(result.brand || '');
        setTags(result.tags || []);
        
        if (result.estimatedPrice) {
          const priceMatch = result.estimatedPrice.match(/\$(\d+)/);
          if (priceMatch) {
            const dollarAmount = parseInt(priceMatch[1]);
            setEcoPoints((dollarAmount * 10).toString());
          }
        }

        toast.success("AI has automatically filled in the item details.");
      }
    } catch (error) {
      console.error('Auto-generation error:', error);
      toast.error("Unable to generate description. Please fill in manually.");
    }
    
    setIsGenerating(false);
  };

  const handleSizePrediction = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image for size prediction");
      return;
    }

    setIsPredictingSize(true);
    
    try {
      const result = await aiDescriptionService.predictSize(images[0]);
      
      if (result && result.predictedSize) {
        setSize(result.predictedSize);
        toast.success(`Predicted size: ${result.predictedSize}. ${result.confidence ? `Confidence: ${result.confidence}` : ''}`);
      }
    } catch (error) {
      console.error('Size prediction error:', error);
      toast.error("Unable to predict size. Please select manually.");
    }
    
    setIsPredictingSize(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !ecoPoints || !category || !condition || images.length === 0) {
      toast.error("Please fill in all required fields and upload at least one image");
      return;
    }

    const hasUnverifiedImages = images.some((_, index) => 
      imageVerificationStatus[index] === 'pending' || imageVerificationStatus[index] === 'rejected'
    );
    
    if (hasUnverifiedImages) {
      toast.error("Please wait for all images to be verified before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageBase64s = await Promise.all(
        images.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(new Error('Failed to read image'));
              reader.readAsDataURL(file);
            })
        )
      );

      await itemsApi.create({
        title,
        description,
        price: parseInt(ecoPoints),
        category,
        type,
        size,
        condition,
        color,
        brand,
        location: location || 'Not specified',
        tags,
        images: imageBase64s,
      });

      toast.success("Your item is now on-processing and awaiting admin approval.");
      navigate('/profile');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("There was an error submitting your item. Please try again.");
    }

    setIsSubmitting(false);
  };

  const getVerificationIcon = (index: number) => {
    const status = imageVerificationStatus[index];
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-amber-500" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">List a New Item</h1>
            <p className="text-muted-foreground">Upload photos and let our AI generate the details for you.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="bg-card border-border overflow-hidden">
            <div className="bg-muted/50 p-6 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Photos
              </h2>
            </div>
            
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-border rounded-xl p-8 bg-background hover:bg-muted/30 transition-colors">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {images.length === 0 ? (
                  <label htmlFor="images" className="cursor-pointer flex flex-col items-center justify-center w-full h-full min-h-[160px]">
                    <div className="bg-muted p-4 rounded-full mb-4">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium mb-1">Click to upload photos</p>
                    <p className="text-muted-foreground text-sm">PNG, JPG up to 10MB (max 5 photos)</p>
                  </label>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 rounded-full p-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-background/90 shadow-sm flex items-center justify-center">
                            {getVerificationIcon(index)}
                          </div>
                        </div>
                      ))}
                      {images.length < 5 && (
                        <label htmlFor="images" className="cursor-pointer aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center hover:bg-muted/50 transition-colors group">
                          <div className="flex flex-col items-center text-muted-foreground group-hover:text-foreground transition-colors">
                            <Upload className="h-6 w-6 mb-2" />
                            <span className="text-sm font-medium">Add More</span>
                          </div>
                        </label>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
                      <Button
                        type="button"
                        onClick={handleAutoGenerate}
                        disabled={isGenerating}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white"
                      >
                        {isGenerating ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                        ) : (
                          <><Sparkles className="h-4 w-4 mr-2" /> AI Auto-Fill Details</>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={handleSizePrediction}
                        disabled={isPredictingSize}
                        variant="outline"
                        className="flex-1"
                      >
                        {isPredictingSize ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Predicting...</>
                        ) : (
                          <><Ruler className="h-4 w-4 mr-2" /> Predict Size</>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border overflow-hidden">
            <div className="bg-muted/50 p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Item Details</h2>
            </div>
            
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Vintage Levi's 501 Original Fit Jeans"
                    required
                    className="bg-background"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the condition, material, fit, and any flaws..."
                    rows={5}
                    required
                    className="bg-background resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ecoPoints">Price (Points) <span className="text-destructive">*</span></Label>
                  <Input
                    id="ecoPoints"
                    type="number"
                    min="0"
                    value={ecoPoints}
                    onChange={(e) => setEcoPoints(e.target.value)}
                    placeholder="250"
                    required
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition <span className="text-destructive">*</span></Label>
                  <select
                    id="condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="" disabled>Select condition</option>
                    {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <select
                    id="size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select size</option>
                    {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g., Nike, Zara"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g., Navy Blue"
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State"
                      className="pl-9 bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 min-h-[32px]">
                    {tags.length === 0 && <span className="text-sm text-muted-foreground">No tags added</span>}
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tags (e.g., vintage, y2k)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="bg-background"
                    />
                    <Button type="button" variant="secondary" onClick={addTag}>Add</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <div className="p-6 border-t border-border bg-muted/20">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-base py-6"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Submitting for Approval...</>
                ) : (
                  'Submit Listing'
                )}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default ListItem;
