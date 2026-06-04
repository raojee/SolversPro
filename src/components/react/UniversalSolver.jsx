import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function UniversalSolver() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const endOfResponseRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to the bottom of the response as it streams
  useEffect(() => {
    if (endOfResponseRef.current) {
      endOfResponseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() && !selectedImage) return;
    if (isLoading) return;

    setIsLoading(true);
    setResponse('');

    try {
      let imageBase64 = null;
      let mimeType = null;
      
      if (selectedImage) {
        imageBase64 = await fileToBase64(selectedImage);
        mimeType = selectedImage.type;
      }

      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: query,
          image: imageBase64 ? {
            data: imageBase64,
            mimeType: mimeType
          } : null
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }

      if (!res.body) {
        throw new Error('ReadableStream not supported by the browser.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setResponse((prev) => prev + chunk);
        }
      }
    } catch (error) {
      console.error('Solver Error:', error);
      setResponse((prev) => prev + '\n\n[Error: Failed to connect to the solver engine. Please try again later.]');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 shadow-sm mb-8">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Your Problem
          </label>
          
          <div className="relative">
            <textarea
              id="prompt"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="w-full min-h-[160px] p-4 pb-14 bg-[#0d0d14] border border-white/[0.1] rounded-xl focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] transition-all resize-y text-white text-lg font-medium"
              placeholder="E.g., Evaluate the limit as x approaches 0 of (sin x)/x, or explain quantum computing."
            ></textarea>
            
            {/* Image Preview Area inside textarea */}
            {imagePreview && (
              <div className="absolute top-4 right-4 relative group inline-block max-w-[200px] bg-[#1a1a24] rounded-lg p-1 border border-white/[0.1] shadow-lg float-right z-10 m-2">
                <img src={imagePreview} alt="Preview" className="h-24 object-contain rounded-md" />
                <button 
                  type="button" 
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  aria-label="Remove image"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}
            
            {/* Toolbar row inside textarea (bottom) */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors text-sm font-medium border border-white/[0.05]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
                Attach Image
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || (!query.trim() && !selectedImage)}
          className={`w-full py-4 px-6 mt-4 rounded-lg text-white font-bold text-lg shadow-sm flex justify-center items-center gap-3 transition-colors ${
            isLoading || (!query.trim() && !selectedImage)
              ? 'bg-[#9ca3af] cursor-not-allowed'
              : 'bg-[#ff6b35] hover:bg-[#ff8c5a]'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking...
            </>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              Solve It
            </>
          )}
        </button>
      </form>

      {/* Results Container */}
      {(response || isLoading) && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl shadow-sm overflow-hidden">
          <div className="bg-[#0d0d14] px-6 py-4 flex items-center justify-between border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              Solver Response
            </h3>
            {isLoading && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b35] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff6b35]"></span>
              </span>
            )}
          </div>
          <div className="p-6 md:p-8 min-h-[200px] max-h-[600px] overflow-y-auto bg-black/20">
            <div className="prose prose-invert text-zinc-300 max-w-none text-[16px] leading-relaxed break-words">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {response}
              </ReactMarkdown>
              {isLoading && (
                <span className="inline-block w-2.5 h-4 ml-1 bg-[#ff6b35] animate-pulse align-middle"></span>
              )}
            </div>
            <div ref={endOfResponseRef} />
          </div>
        </div>
      )}
    </div>
  );
}
