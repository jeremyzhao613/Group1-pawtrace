import React, { useState, useRef } from 'react';
import { fileToBase64, analyzePetHealth, generatePetAdvice } from '../services/geminiService';

interface AIHealthTabProps {
  isActive: boolean;
}

type ServiceType = 'diagnosis' | 'health' | 'behavior' | 'diet';

const AIHealthTab: React.FC<AIHealthTabProps> = ({ isActive }) => {
  const [selectedService, setSelectedService] = useState<ServiceType>('diagnosis');
  
  // Persistent State for all tabs
  const [diagnosisData, setDiagnosisData] = useState<{
    file: File | null;
    preview: string | null;
    symptoms: string;
    result: string | null;
  }>({ file: null, preview: null, symptoms: '', result: null });

  const [textData, setTextData] = useState<{
    health: { input: string; result: string | null };
    behavior: { input: string; result: string | null };
    diet: { input: string; result: string | null };
  }>({
    health: { input: '', result: null },
    behavior: { input: '', result: null },
    diet: { input: '', result: null }
  });

  const [loadingState, setLoadingState] = useState<{ [key in ServiceType]: boolean }>({
    diagnosis: false,
    health: false,
    behavior: false,
    diet: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers for Diagnosis ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size too large. Please choose an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        setDiagnosisData(prev => ({
          ...prev,
          file,
          preview: evt.target?.result as string,
          result: null // Clear previous result on new image
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetDiagnosis = () => {
    setDiagnosisData({ file: null, preview: null, symptoms: '', result: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyzeVisual = async () => {
    if (!diagnosisData.file) {
      alert("Please upload a photo of your pet.");
      return;
    }
    setLoadingState(prev => ({ ...prev, diagnosis: true }));
    
    try {
      const base64 = await fileToBase64(diagnosisData.file);
      const result = await analyzePetHealth(
        base64, 
        diagnosisData.file.type, 
        diagnosisData.symptoms || "No specific symptoms provided, please do a general visual health check."
      );
      setDiagnosisData(prev => ({ ...prev, result }));
    } catch (error) {
      console.error(error);
      setDiagnosisData(prev => ({ ...prev, result: "Error: Unable to complete analysis. Please check your connection and try again." }));
    } finally {
      setLoadingState(prev => ({ ...prev, diagnosis: false }));
    }
  };

  // --- Handlers for Text Services ---

  const handleTextInputChange = (val: string) => {
    if (selectedService === 'diagnosis') return;
    setTextData(prev => ({
      ...prev,
      [selectedService]: { ...prev[selectedService], input: val }
    }));
  };

  const handleClearTextResult = () => {
    if (selectedService === 'diagnosis') return;
    setTextData(prev => ({
      ...prev,
      [selectedService]: { ...prev[selectedService], result: null }
    }));
  };

  const handleGenerateTextAdvice = async () => {
    if (selectedService === 'diagnosis') return;
    
    const currentInput = textData[selectedService].input;
    if (!currentInput.trim()) {
      alert("Please provide some details about your pet.");
      return;
    }

    setLoadingState(prev => ({ ...prev, [selectedService]: true }));
    
    try {
      const result = await generatePetAdvice(selectedService, currentInput);
      setTextData(prev => ({
        ...prev,
        [selectedService]: { ...prev[selectedService], result }
      }));
    } catch (error) {
      console.error(error);
      setTextData(prev => ({
        ...prev,
        [selectedService]: { ...prev[selectedService], result: "Error: Unable to generate advice. Please try again." }
      }));
    } finally {
      setLoadingState(prev => ({ ...prev, [selectedService]: false }));
    }
  };

  // --- Helpers ---

  const renderFormattedResult = (text: string) => {
    return (
      <div dangerouslySetInnerHTML={{ 
        __html: text
          .replace(/\n/g, '<br/>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/### (.*?)(<br\/>|$)/g, '<h4 class="text-primary font-bold text-sm mt-4 mb-2 border-b border-primary/20 pb-1">$1</h4>')
          .replace(/- (.*?)(<br\/>|$)/g, '<div class="flex items-start gap-2 mb-1"><span class="text-primary">•</span><span>$1</span></div>') 
      }} />
    );
  };

  const services = [
    { id: 'diagnosis', icon: 'fas fa-camera-retro', title: 'Visual Diagnosis', desc: 'Upload a photo to spot potential issues.', isNew: true },
    { id: 'health', icon: 'fas fa-notes-medical', title: 'Health Report', desc: 'Track weight, vaccinations, and milestones.' },
    { id: 'behavior', icon: 'fas fa-brain', title: 'Behavior Insight', desc: 'Spot changes and share training tips.' },
    { id: 'diet', icon: 'fas fa-carrot', title: 'Diet Plan', desc: 'Personalize a menu based on breed and age.' },
  ];

  const getPlaceholderForService = (id: string) => {
    switch(id) {
      case 'health': return "Describe your pet's recent health status, last vet visit, weight changes, or any specific concerns (e.g., 'My cat has been lethargic lately and eating less')...";
      case 'behavior': return "Describe the behavior you're observing (e.g., 'My dog barks at strangers on walks' or 'My cat is scratching the sofa')...";
      case 'diet': return "Enter your pet's breed, age, weight, and current food habits (e.g., '3-year-old Corgi, 12kg, loves chicken but has a sensitive stomach')...";
      default: return "";
    }
  };

  if (!isActive) return null;

  const isCurrentLoading = loadingState[selectedService];
  // Determine current result to display based on service type
  const currentTextResult = selectedService !== 'diagnosis' ? textData[selectedService].result : null;

  return (
    <div className="tab-page h-full flex flex-col animate-fadeIn">
      <div className="pixel-card ai-panel space-y-6 flex-1 flex flex-col overflow-hidden">
        {/* Header Section */}
        <div className="space-y-3 relative z-10 shrink-0">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark/5 text-[10px] font-semibold uppercase tracking-widest backdrop-blur-sm">
            AI Health Engine · Gemini 2.5
          </span>
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-dark">AI Wellness Suite</h2>
            <span className="px-3 py-1 rounded-full bg-primary/20 text-xs font-semibold text-dark border border-primary/30">Premium</span>
          </div>
          <p className="text-sm text-gray-600 max-w-2xl">
            Use our <strong>Gemini-powered</strong> tools to monitor your pet's wellbeing. Select <strong>Visual Diagnosis</strong> for photos, or other tabs for comprehensive text-based reports.
          </p>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelectedService(service.id as ServiceType)}
              className={`ai-service-card text-left relative group transition-all duration-300 ${selectedService === service.id ? 'ring-2 ring-primary bg-white shadow-lg scale-[1.02]' : 'opacity-80 hover:opacity-100'}`}
            >
              {service.isNew && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm animate-bounce z-20">
                  NEW
                </span>
              )}
              <div className="flex items-center gap-2 text-sm font-semibold text-dark mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedService === service.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                   <i className={`${service.icon} text-sm`}></i>
                </div>
                <span>{service.title}</span>
              </div>
              <p className="text-[10px] text-gray-600 leading-relaxed pl-1">{service.desc}</p>
            </button>
          ))}
        </div>

        {/* Output Panel */}
        <div className="glass-panel bg-white/40 border-white/60 flex-1 min-h-0 flex flex-col overflow-hidden relative mt-2">
          
          {/* ------------ VISUAL DIAGNOSIS MODE ------------ */}
          {selectedService === 'diagnosis' ? (
            <div className="w-full h-full flex flex-col animate-slideInLeft">
              <div className="flex items-center justify-between border-b border-gray-200/50 pb-3 shrink-0">
                <h3 className="font-semibold text-dark flex items-center gap-2">
                  <i className="fas fa-microscope text-primary"></i> Visual Diagnosis
                </h3>
                <div className="flex items-center gap-3">
                   {diagnosisData.file && !isCurrentLoading && (
                      <button onClick={handleResetDiagnosis} className="text-[10px] text-red-500 hover:text-red-600 font-semibold uppercase tracking-wider">
                        <i className="fas fa-trash-alt mr-1"></i> Reset
                      </button>
                   )}
                </div>
              </div>

              <div className="flex-1 grid md:grid-cols-2 gap-6 mt-4 min-h-0 overflow-hidden">
                {/* Input Column */}
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  <div 
                    className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all duration-300 cursor-pointer relative overflow-hidden group min-h-[220px] flex flex-col justify-center items-center
                      ${diagnosisData.preview ? 'border-primary/50 bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-white/50'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                    />
                    {diagnosisData.preview ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img src={diagnosisData.preview} alt="Preview" className="max-w-full max-h-60 object-contain rounded-lg shadow-sm" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                           <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-dark text-xs px-3 py-1 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">Change Photo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-gray-500 py-6">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                          <i className="fas fa-camera text-2xl text-primary/80"></i>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-dark">Upload Pet Photo</p>
                          <p className="text-[10px] text-gray-400 mt-1">Tap to browse or take a picture</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Symptoms (Optional)</label>
                    <textarea 
                      className="pixel-input h-24 resize-none text-xs bg-white/60 focus:bg-white/90 transition-colors" 
                      placeholder="Describe visible issues like red spots, limping, or changes in appetite..."
                      value={diagnosisData.symptoms}
                      onChange={(e) => setDiagnosisData(prev => ({ ...prev, symptoms: e.target.value }))}
                    />
                  </div>

                  <button 
                    onClick={handleAnalyzeVisual}
                    disabled={isCurrentLoading || !diagnosisData.file}
                    className="pixel-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-12 text-sm shadow-xl shadow-primary/10"
                  >
                    {isCurrentLoading ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin"></i>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-wand-magic-sparkles"></i>
                        <span>Start AI Diagnosis</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Results Column */}
                <div className="bg-white/50 rounded-2xl p-5 border border-white/60 h-full overflow-y-auto custom-scrollbar shadow-inner">
                  {isCurrentLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <i className="fas fa-paw text-primary/40 text-lg animate-pulse"></i>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-dark">Analyzing Pet Health</p>
                        <p className="text-xs text-gray-500">Processing visual data with Gemini...</p>
                      </div>
                    </div>
                  ) : diagnosisData.result ? (
                    <div className="prose prose-sm max-w-none text-xs text-dark leading-relaxed animate-fadeIn">
                      {renderFormattedResult(diagnosisData.result)}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-4">
                      <div className="w-20 h-20 bg-gray-100/50 rounded-full flex items-center justify-center mb-4">
                        <i className="fas fa-file-medical-alt text-3xl opacity-20 text-dark"></i>
                      </div>
                      <p className="text-sm font-medium text-gray-600">Results Waiting</p>
                      <p className="text-xs mt-1 max-w-[200px] leading-relaxed">Upload a photo and describe symptoms to receive a detailed AI assessment.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            
            /* ------------ TEXT-BASED MODES (Health, Behavior, Diet) ------------ */
            <div className="w-full h-full flex flex-col animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-200/50 pb-3 shrink-0">
                <h3 className="font-semibold text-dark flex items-center gap-2">
                  <i className={`fas ${services.find(s => s.id === selectedService)?.icon} text-primary`}></i>
                  {services.find(s => s.id === selectedService)?.title}
                </h3>
                {currentTextResult && !isCurrentLoading && (
                  <button onClick={handleClearTextResult} className="text-[10px] text-primary hover:underline font-semibold">
                    Create New Report
                  </button>
                )}
              </div>

              <div className="flex-1 grid md:grid-cols-2 gap-6 mt-4 min-h-0 overflow-hidden">
                {/* Input Column */}
                <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="bg-white/50 rounded-xl p-4 border border-white/60">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">
                      Pet Details & Context
                    </label>
                    <textarea 
                      className="pixel-input h-40 resize-none text-xs bg-white/80 focus:bg-white transition-colors leading-relaxed" 
                      placeholder={getPlaceholderForService(selectedService)}
                      value={textData[selectedService].input}
                      onChange={(e) => handleTextInputChange(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-400 mt-2 text-right">
                      The more details you provide, the better the AI advice.
                    </p>
                  </div>

                  <button 
                    onClick={handleGenerateTextAdvice}
                    disabled={isCurrentLoading || !textData[selectedService].input.trim()}
                    className="pixel-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-12 text-sm shadow-xl shadow-primary/10 mt-auto"
                  >
                    {isCurrentLoading ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin"></i>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic"></i>
                        <span>Generate Report</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Results Column */}
                <div className="bg-white/50 rounded-2xl p-5 border border-white/60 h-full overflow-y-auto custom-scrollbar shadow-inner">
                  {isCurrentLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <i className="fas fa-brain text-primary/40 text-lg animate-pulse"></i>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-dark">Consulting AI Expert</p>
                        <p className="text-xs text-gray-500">Generating your custom report...</p>
                      </div>
                    </div>
                  ) : currentTextResult ? (
                    <div className="prose prose-sm max-w-none text-xs text-dark leading-relaxed animate-fadeIn">
                      {renderFormattedResult(currentTextResult)}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-4">
                      <div className="w-20 h-20 bg-gray-100/50 rounded-full flex items-center justify-center mb-4">
                        <i className="fas fa-clipboard-list text-3xl opacity-20 text-dark"></i>
                      </div>
                      <p className="text-sm font-medium text-gray-600">Ready to Assist</p>
                      <p className="text-xs mt-1 max-w-[200px] leading-relaxed">
                        Provide details on the left and click "Generate Report" to receive AI-powered advice.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIHealthTab;