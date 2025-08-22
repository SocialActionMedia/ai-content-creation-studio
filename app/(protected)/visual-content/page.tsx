"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function VisualContentPage() {
  const supabase = getSupabaseBrowserClient();
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [imageForm, setImageForm] = useState({
    prompt: "",
    style: "realistic",
    size: "1024x1024",
    quality: "standard"
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    fetchGeneratedImages();
  }, []);

  const fetchGeneratedImages = async () => {
    const { data } = await supabase
      .from("images")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setGeneratedImages(data || []);
  };

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageForm.prompt) return;
    
    setLoading(true);
    setGeneratedImage(null);
    
    try {
      const res = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imageForm)
      });
      
      const data = await res.json();
      if (res.ok) {
        setGeneratedImage(data.url);
        await fetchGeneratedImages(); // Refresh the list
      }
    } catch (error) {
      console.error("Image generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveImage = async () => {
    if (!generatedImage || !imageForm.prompt) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("images").insert({
        prompt: imageForm.prompt,
        url: generatedImage,
        style: imageForm.style,
        size: imageForm.size,
        quality: imageForm.quality,
        created_by: user.id
      });
      
      await fetchGeneratedImages();
      alert("Image saved to your library!");
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const styles = [
    { value: "realistic", label: "Realistic", icon: "📷" },
    { value: "artistic", label: "Artistic", icon: "🎨" },
    { value: "cartoon", label: "Cartoon", icon: "🖼️" },
    { value: "abstract", label: "Abstract", icon: "🔮" },
    { value: "vintage", label: "Vintage", icon: "📺" },
    { value: "futuristic", label: "Futuristic", icon: "🚀" }
  ];

  const sizes = [
    { value: "256x256", label: "Small (256x256)" },
    { value: "512x512", label: "Medium (512x512)" },
    { value: "1024x1024", label: "Large (1024x1024)" },
    { value: "1792x1024", label: "Wide (1792x1024)" },
    { value: "1024x1792", label: "Tall (1024x1792)" }
  ];

  const qualities = [
    { value: "standard", label: "Standard" },
    { value: "hd", label: "High Definition" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Visual Content Tool</h1>
        <p className="text-gray-600">Create stunning images and graphics with AI-powered generation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Image</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateImage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Image Prompt</label>
                  <textarea
                    className="w-full border rounded px-3 py-2 h-24"
                    placeholder="Describe the image you want to create..."
                    value={imageForm.prompt}
                    onChange={(e) => setImageForm({ ...imageForm, prompt: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Style</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={imageForm.style}
                    onChange={(e) => setImageForm({ ...imageForm, style: e.target.value })}
                  >
                    {styles.map((style) => (
                      <option key={style.value} value={style.value}>
                        {style.icon} {style.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Size</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={imageForm.size}
                      onChange={(e) => setImageForm({ ...imageForm, size: e.target.value })}
                    >
                      {sizes.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quality</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-sm"
                      value={imageForm.quality}
                      onChange={(e) => setImageForm({ ...imageForm, quality: e.target.value })}
                    >
                      {qualities.map((quality) => (
                        <option key={quality.value} value={quality.value}>
                          {quality.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !imageForm.prompt}
                  className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Image"}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Image Library */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generatedImages.slice(0, 5).map((image) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image)}
                    className="w-full p-2 border rounded-lg hover:border-blue-300 transition-colors text-left"
                  >
                    <div className="text-sm font-medium truncate">{image.prompt}</div>
                    <div className="text-xs text-gray-500">
                      {image.style} • {image.size}
                    </div>
                  </button>
                ))}
                {generatedImages.length === 0 && (
                  <p className="text-sm text-gray-500">No images generated yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Image Panel */}
        <div className="lg:col-span-2 space-y-4">
          {generatedImage ? (
            <Card>
              <CardHeader>
                <CardTitle>Generated Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={generatedImage} 
                      alt="Generated" 
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Prompt:</span>
                      <p className="text-gray-600">{imageForm.prompt}</p>
                    </div>
                    <div>
                      <span className="font-medium">Style:</span>
                      <p className="text-gray-600">{styles.find(s => s.value === imageForm.style)?.label}</p>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>
                      <p className="text-gray-600">{imageForm.size}</p>
                    </div>
                    <div>
                      <span className="font-medium">Quality:</span>
                      <p className="text-gray-600">{imageForm.quality}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveImage}
                      className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
                    >
                      Save to Library
                    </button>
                    <button
                      onClick={() => setGeneratedImage(null)}
                      className="bg-gray-600 text-white rounded px-4 py-2 hover:bg-gray-700"
                    >
                      Generate New
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Image Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-lg font-medium">Ready to create amazing images?</p>
                  <p className="text-sm">Fill out the form and click "Generate Image" to get started</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Image Details */}
          {selectedImage && (
            <Card>
              <CardHeader>
                <CardTitle>Image Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src={selectedImage.url} 
                      alt={selectedImage.prompt} 
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Prompt:</span>
                      <p className="text-gray-600">{selectedImage.prompt}</p>
                    </div>
                    <div>
                      <span className="font-medium">Style:</span>
                      <p className="text-gray-600">{selectedImage.style}</p>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>
                      <p className="text-gray-600">{selectedImage.size}</p>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-gray-600">
                        {new Date(selectedImage.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Image Tips */}
          <Card>
            <CardHeader>
              <CardTitle>AI Image Generation Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Prompt Writing</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Be specific and descriptive</li>
                    <li>• Include style and mood</li>
                    <li>• Mention lighting and composition</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Style Selection</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Realistic for product photos</li>
                    <li>• Artistic for creative content</li>
                    <li>• Cartoon for illustrations</li>
                  </ul>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Size Guidelines</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Square for social media</li>
                    <li>• Wide for banners</li>
                    <li>• Tall for stories</li>
                  </ul>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">Best Practices</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Avoid copyrighted content</li>
                    <li>• Test different prompts</li>
                    <li>• Save successful generations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
