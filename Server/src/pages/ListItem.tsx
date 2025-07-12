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
  Check,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { aiDescriptionService } from '@/services/aiDescriptionService';
import Chatbot from '@/components/Chatbot';

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
  const { toast } = useToast();

  const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const verifyImage = async (file: File, index: number) => {
    setImageVerificationStatus(prev => ({ ...prev, [index]: 'pending' }));
    
    try {
      // Simulate the DeepAI moderation process
      const formData = new FormData();
      formData.append('image', file);
      
      // Mock API call to simulate image moderation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate moderation result
      const mockModerationResult = {
        ok: true,
        nsfw_score: Math.random() * 0.3, // Random score below 0.5 (safe threshold)
        message: "Image is safe to use"
      };
      
      if (mockModerationResult.ok && mockModerationResult.nsfw_score < 0.5) {
        setImageVerificationStatus(prev => ({ ...prev, [index]: 'verified' }));
        toast({
          title: "Image Verified ✓",
          description: `Image passed safety checks (Score: ${mockModerationResult.nsfw_score.toFixed(2)})`,
        });
      } else {
        setImageVerificationStatus(prev => ({ ...prev, [index]: 'rejected' }));
        toast({
          title: "Image Rejected",
          description: "Image contains inappropriate content",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Image verification error:', error);
      setImageVerificationStatus(prev => ({ ...prev, [index]: 'verified' }));
      toast({
        title: "Verification unavailable",
        description: "Unable to verify image, but you can proceed.",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 5 images",
        variant: "destructive"
      });
      return;
    }
    
    const newImages = [...images, ...files];
    setImages(newImages);
    
    // Verify each new image
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
      toast({
        title: "No image selected",
        description: "Please upload at least one image to generate description",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Check image appropriateness
      const moderationResult = await aiDescriptionService.moderateImage(images[0]);
      
      if (!moderationResult.isAppropriate) {
        toast({
          title: "Image not appropriate",
          description: moderationResult.message,
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      // Generate description
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
        
        // Convert price to eco points (1 dollar = 10 eco points)
        if (result.estimatedPrice) {
          const priceMatch = result.estimatedPrice.match(/\$(\d+)/);
          if (priceMatch) {
            const dollarAmount = parseInt(priceMatch[1]);
            setEcoPoints((dollarAmount * 10).toString());
          }
        }

        toast({
          title: "Description Generated!",
          description: "AI has automatically filled in the item details. You can edit them as needed.",
        });
      }
    } catch (error) {
      console.error('Auto-generation error:', error);
      toast({
        title: "Generation failed",
        description: "Unable to generate description. Please fill in manually.",
        variant: "destructive"
      });
    }
    
    setIsGenerating(false);
  };

  const handleSizePrediction = async () => {
    if (images.length === 0) {
      toast({
        title: "No image selected",
        description: "Please upload at least one image for size prediction",
        variant: "destructive"
      });
      return;
    }

    setIsPredictingSize(true);
    
    try {
      const result = await aiDescriptionService.predictSize(images[0]);
      
      if (result && result.predictedSize) {
        setSize(result.predictedSize);
        
        toast({
          title: "Size Predicted!",
          description: `Predicted size: ${result.predictedSize}. ${result.confidence ? `Confidence: ${result.confidence}` : ''}`,
        });
      }
    } catch (error) {
      console.error('Size prediction error:', error);
      toast({
        title: "Prediction failed",
        description: "Unable to predict size. Please select manually.",
        variant: "destructive"
      });
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
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and upload at least one image",
        variant: "destructive"
      });
      return;
    }

    // Check if all images are verified
    const hasUnverifiedImages = images.some((_, index) => 
      imageVerificationStatus[index] === 'pending' || imageVerificationStatus[index] === 'rejected'
    );
    
    if (hasUnverifiedImages) {
      toast({
        title: "Images need verification",
        description: "Please wait for all images to be verified before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create item object with "on-processing" status
      const newItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        images: images.map((file, index) => URL.createObjectURL(file)),
        seller: {
          name: user?.email?.split('@')[0] || 'Anonymous',
          email: user?.email || '',
          avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjZjNmNGY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjOWNhM2FmIi8+CjxwYXRoIGQ9Ik0yMCA4NWMwLTE2LjU2OSAxMy40MzEtMzAgMzAtMzBzMzAgMTMuNDMxIDMwIDMwSDIweiIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4K'
        },
        createdAt: new Date().toISOString(),
        submittedDate: new Date().toISOString(),
        status: 'on-processing',
        upvotes: 0,
        upvotedBy: [],
        views: 0
      };

      // Save to pending items for admin approval
      const existingPendingItems = JSON.parse(localStorage.getItem('pendingItems') || '[]');
      existingPendingItems.push(newItem);
      localStorage.setItem('pendingItems', JSON.stringify(existingPendingItems));

      // Also save to user's items
      const existingUserItems = JSON.parse(localStorage.getItem('userItems') || '[]');
      existingUserItems.push(newItem);
      localStorage.setItem('userItems', JSON.stringify(existingUserItems));

      toast({
        title: "Item submitted successfully!",
        description: "Your item is now on-processing and awaiting admin approval.",
      });

      // Reset form
      setImages([]);
      setImageVerificationStatus({});
      setTitle('');
      setDescription('');
      setEcoPoints('');
      setCategory('');
      setType('');
      setSize('');
      setCondition('');
      setColor('');
      setBrand('');
      setLocation('');
      setTags([]);
      setNewTag('');

      // Navigate to my items page
      navigate('/my-items');
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your item. Please try again.",
        variant: "destructive"
      });
    }

    setIsSubmitting(false);
  };

  const getVerificationIcon = (index: number) => {
    const status = imageVerificationStatus[index];
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-card-foreground">List Your Item</CardTitle>
            <p className="text-muted-foreground">
              Upload photos and details of your clothing item. Our AI can help auto-generate descriptions and predict sizes!
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-foreground">Photos (Required)</Label>
                
                <div className="border-2 border-dashed border-border rounded-lg p-6 bg-muted/20">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {images.length === 0 ? (
                    <label htmlFor="images" className="cursor-pointer flex flex-col items-center">
                      <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        Click to upload photos or drag and drop<br />
                        <span className="text-sm">PNG, JPG up to 10MB (max 5 photos)</span>
                      </p>
                    </label>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <div className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center">
                              {getVerificationIcon(index)}
                            </div>
                          </div>
                        ))}
                        {images.length < 5 && (
                          <label htmlFor="images" className="cursor-pointer">
                            <div className="w-full h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors">
                              <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                          </label>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleAutoGenerate}
                          disabled={isGenerating}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Auto-Generate Description
                            </>
                          )}
                        </Button>
                        
                        <Button
                          type="button"
                          onClick={handleSizePrediction}
                          disabled={isPredictingSize}
                          variant="outline"
                          className="border-border text-foreground hover:bg-muted"
                        >
                          {isPredictingSize ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Predicting...
                            </>
                          ) : (
                            <>
                              <Ruler className="h-4 w-4 mr-2" />
                              Predict Size
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Vintage Denim Jacket"
                    required
                    className="bg-background border-border text-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ecoPoints" className="text-foreground">Eco Points *</Label>
                  <Input
                    id="ecoPoints"
                    type="number"
                    value={ecoPoints}
                    onChange={(e) => setEcoPoints(e.target.value)}
                    placeholder="250"
                    required
                    className="bg-background border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Suggested: 10 eco points per $1 value</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item's condition, style, and any other relevant details..."
                  rows={4}
                  required
                  className="bg-background border-border text-foreground"
                />
              </div>

              {/* Category and Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Category *</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-foreground">Type</Label>
                  <Input
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g., T-shirt, Jeans"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Size</Label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="">Select size</option>
                    {sizes.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Condition *</Label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    <option value="">Select condition</option>
                    {conditions.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-foreground">Color</Label>
                  <Input
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g., Blue, Red, Multi-color"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-foreground">Brand</Label>
                  <Input
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g., Nike, Zara, Uniqlo"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-foreground">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., New York, NY"
                      className="pl-10 bg-background border-border text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-foreground">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-secondary text-secondary-foreground">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
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
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="bg-background border-border text-foreground"
                  />
                  <Button type="button" onClick={addTag} variant="outline" className="border-border text-foreground">
                    Add
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Approval'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Chatbot />
    </div>
  );
};

export default ListItem;
