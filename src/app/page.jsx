"use client";

import { useState, useRef, useEffect } from "react";

export default function HomePage() {
  const [step, setStep] = useState(1); // 1: idea, 2: contributors, 3: generating
  const [projectIdea, setProjectIdea] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [contributors, setContributors] = useState([{ name: "", expertise: [] }]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expertiseInput, setExpertiseInput] = useState({});
  const [showSuggestions, setShowSuggestions] = useState({});

  const expertiseOptions = [
    "Pathology", "Radiology", "Radiation Oncology", "Medical Oncology",
    "Medical Physics", "Treatment Planning Systems", "Dose Optimization", 
    "Image Reconstruction", "Image Segmentation", "Computer Vision", 
    "Deep Learning", "Large Language Models", "Agentic AI", 
    "Reinforcement Learning", "Medical Imaging Data", "Data Curation", 
    "Annotation & Labeling", "Data Engineering", "Python", "MATLAB", 
    "High Performance Computing", "MLOps", "Backend Systems", 
    "Scientific Writing", "Literature Review"
  ];

  const addContributor = () => {
    setContributors([...contributors, { name: "", expertise: [] }]);
  };

  const removeContributor = (index) => {
    setContributors(contributors.filter((_, i) => i !== index));
  };

  const updateContributor = (index, field, value) => {
    const updated = [...contributors];
    updated[index][field] = value;
    setContributors(updated);
  };

  const addExpertise = (index, expertise) => {
    const updated = [...contributors];
    if (!updated[index].expertise.includes(expertise)) {
      updated[index].expertise = [...updated[index].expertise, expertise];
      setContributors(updated);
    }
    setExpertiseInput({ ...expertiseInput, [index]: "" });
    setShowSuggestions({ ...showSuggestions, [index]: false });
  };

  const handleExpertiseKeyPress = (index, e) => {
    if (e.key === 'Enter' && expertiseInput[index]?.trim()) {
      e.preventDefault();
      addExpertise(index, expertiseInput[index].trim());
    }
  };

  const removeExpertise = (index, expertise) => {
    const updated = [...contributors];
    updated[index].expertise = updated[index].expertise.filter(e => e !== expertise);
    setContributors(updated);
  };

  const getFilteredSuggestions = (input) => {
    return expertiseOptions.filter(option => 
      option.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep(3);
    setLoading(true);
    setError(null);
    setResult(null);
    setLogs([]);

    // Simulate streaming logs
    const logMessages = [
      "🚀 Starting project generation...",
      "🔍 Step 1: Interpreting project requirements...",
      "✅ Project interpretation complete",
      "📋 Step 2: Generating tasks and milestones...",
      "⚡ Creating project structure...",
      "👥 Step 3: Assigning tasks to contributors...",
      "🎯 Optimizing task distribution...",
      "📄 Step 4: Generating project artifacts...",
      "📝 Creating documentation...",
      "🌐 Step 5: Setting up Notion workspace...",
      "📚 Notion page created successfully",
      "🐙 Step 6: Creating GitHub repository...",
      "🔧 Setting up repository structure...",
      "✨ Project generation complete!"
    ];

    // Add logs progressively
    for (let i = 0; i < logMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      setLogs(prev => [...prev, { message: logMessages[i], timestamp: new Date().toLocaleTimeString() }]);
    }

    try {
      const response = await fetch("/api/generate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_idea: projectIdea,
          special_instructions: specialInstructions,
          contributors: contributors.filter((c) => c.name.trim()),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate project");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLogs(prev => [...prev, { message: `❌ Error: ${err.message}`, timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleIdeaSubmit = (e) => {
    e.preventDefault();
    if (projectIdea.trim()) {
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {step === 1 && (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="text-center mb-12">
            <div className="text-6xl font-bold text-gray-900 mb-2 transform hover:scale-105 transition-transform duration-300" style={{fontFamily: 'Comic Sans MS, cursive, system-ui'}}>
            Let's vibe ✨ 
            </div>
            <div className="text-lg text-gray-600 font-medium tracking-wide">AI Project Generator 🚀</div>
          </div>
          
          <form onSubmit={handleIdeaSubmit} className="w-full max-w-2xl">
            <div className="relative">
              <textarea
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                placeholder="Describe your project idea..."
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none shadow-sm hover:shadow-md transition-shadow resize-none min-h-[60px] max-h-[200px] overflow-y-auto"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '60px'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                required
              />
              <button
                type="submit"
                className="absolute right-2 bottom-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-gray-800 mb-2">Who would you like to add to this project?</h2>
            <p className="text-gray-600">Add team members and their expertise</p>
          </div>

          <div className="space-y-6">
            {contributors.map((contributor, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="text"
                    value={contributor.name}
                    onChange={(e) => updateContributor(index, "name", e.target.value)}
                    placeholder="Team member name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  {contributors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContributor(index)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={expertiseInput[index] || ""}
                      onChange={(e) => {
                        setExpertiseInput({ ...expertiseInput, [index]: e.target.value });
                        setShowSuggestions({ ...showSuggestions, [index]: e.target.value.length > 0 });
                      }}
                      onKeyPress={(e) => handleExpertiseKeyPress(index, e)}
                      placeholder="Add expertise (e.g., Machine Learning, Data Science...) - Press Enter to add"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                    
                    {showSuggestions[index] && expertiseInput[index] && getFilteredSuggestions(expertiseInput[index]).length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                        {getFilteredSuggestions(expertiseInput[index]).map((suggestion, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => addExpertise(index, suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {suggestion}
                          </button>
                        ))}
                        <div className="border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
                          Press Enter to add "{expertiseInput[index]}" as custom expertise
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {contributor.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {contributor.expertise.map((exp, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {exp}
                        <button
                          type="button"
                          onClick={() => removeExpertise(index, exp)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addContributor}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              + Add Another Team Member
            </button>

            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Special Instructions (Optional)</h3>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Add any special instructions for the AI agent (e.g., 'Give more backend tasks to John', 'Focus on 6-month timeline', 'Prioritize mobile development')..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-center pt-6">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Generate Project
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-gray-800 mb-2">Generating Your Project</h2>
            <p className="text-gray-600">Please wait while we create your project...</p>
          </div>

          <div className="bg-black rounded-lg p-6 font-mono text-sm max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-green-400 mb-1">
                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
              </div>
            ))}
            {loading && (
              <div className="text-green-400 animate-pulse">
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> ▋
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 font-medium">Error occurred:</div>
              <div className="text-red-600">{error}</div>
            </div>
          )}

          {result && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">✅ Project Generated Successfully!</h3>
              <div className="text-lg text-gray-700 mb-4">
                <strong>Title:</strong> {result.title}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {result.notion_url && (
                  <a
                    href={result.notion_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="font-medium text-gray-800">📄 Notion Project Page</div>
                    <div className="text-sm text-gray-600">View project documentation</div>
                  </a>
                )}
                {result.github_url && (
                  <a
                    href={result.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div className="font-medium text-gray-800">🐙 GitHub Repository</div>
                    <div className="text-sm text-gray-600">Access source code</div>
                  </a>
                )}
              </div>

              <button
                onClick={() => {
                  setStep(1);
                  setProjectIdea("");
                  setSpecialInstructions("");
                  setContributors([{ name: "", expertise: [] }]);
                  setResult(null);
                  setLogs([]);
                }}
                className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Create Another Project
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
