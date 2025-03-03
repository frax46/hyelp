"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { isAdminEmail } from "../../utils/adminAccess";

type Question = {
  id: string;
  text: string;
  description: string;
  category: string;
  isActive: boolean;
};

export default function AdminQuestionsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for new/edit question
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    description: "",
    category: "",
    isActive: true
  });

  // Check admin status
  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push("/sign-in?redirect=/admin/questions");
      return;
    }
    
    const userEmail = user.primaryEmailAddress?.emailAddress;
    const hasAdminAccess = isAdminEmail(userEmail);
    setIsAdmin(hasAdminAccess);
    
    if (!hasAdminAccess) {
      router.push("/");
    }
  }, [user, isLoaded, router]);

  // Fetch questions
  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/admin/questions');
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        setQuestions(data);
        setLoading(false);
      } catch (err) {
        setError('Error loading questions. Please try again.');
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const resetForm = () => {
    setFormData({
      text: "",
      description: "",
      category: "",
      isActive: true
    });
    setFormMode('create');
    setCurrentQuestion(null);
  };

  const handleEditQuestion = (question: Question) => {
    setFormData({
      text: question.text,
      description: question.description,
      category: question.category,
      isActive: question.isActive
    });
    setCurrentQuestion(question);
    setFormMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const endpoint = formMode === 'create' 
        ? '/api/admin/questions' 
        : `/api/admin/questions/${currentQuestion?.id}`;
        
      const method = formMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${formMode} question`);
      }
      
      // Refresh question list
      const updatedQuestionsResponse = await fetch('/api/admin/questions');
      const updatedQuestions = await updatedQuestionsResponse.json();
      setQuestions(updatedQuestions);
      
      // Reset form
      resetForm();
    } catch (err) {
      setError(`Error ${formMode === 'create' ? 'creating' : 'updating'} question. Please try again.`);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete question');
      }
      
      // Update list
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      setError('Error deleting question. Please try again.');
    }
  };

  if (!isLoaded || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Checking your permissions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Question Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Question Form */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {formMode === 'create' ? 'Create New Question' : 'Edit Question'}
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="text" className="block text-gray-700 mb-2">
                Question Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="text"
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="E.g., How safe is this neighborhood?"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Provide additional context for this question"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                <option value="Safety">Safety</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Noise">Noise</option>
                <option value="Community">Community</option>
                <option value="Transport">Transport</option>
                <option value="Amenities">Amenities</option>
                <option value="General">General</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="isActive" className="ml-2 text-gray-700">
                Active (visible to users)
              </label>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm transition-colors"
              >
                {formMode === 'create' ? 'Create Question' : 'Update Question'}
              </button>
              
              {formMode === 'edit' && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Question List */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">All Questions</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-green-600 border-r-2"></div>
            </div>
          ) : questions.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">No questions found. Create your first question.</p>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div 
                  key={question.id} 
                  className={`border rounded-lg p-4 ${!question.isActive ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{question.text}</h3>
                      <p className="text-sm text-gray-500 mt-1">Category: {question.category}</p>
                      {!question.isActive && (
                        <span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded mt-2">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="Edit question"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label="Delete question"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {question.description && (
                    <p className="text-sm text-gray-600 mt-2">{question.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 