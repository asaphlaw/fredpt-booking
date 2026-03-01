'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuestionnaireData {
  name: string;
  email: string;
  phone: string;
  age: string;
  height: string;
  weight: string;
  fitness_goals: string[];
  experience: string;
  injuries: string;
  preferred_times: string[];
}

const fitnessGoalsOptions = [
  'Weight Loss',
  'Muscle Gain',
  'Strength Training',
  'Endurance',
  'Flexibility',
  'Sport Performance',
  'Rehabilitation',
  'General Fitness'
];

const timeOptions = [
  'Early Morning (6-9am)',
  'Morning (9am-12pm)',
  'Afternoon (12-5pm)',
  'Evening (5-9pm)'
];

export default function QuestionnaireForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<QuestionnaireData>({
    name: '',
    email: '',
    phone: '',
    age: '',
    height: '',
    weight: '',
    fitness_goals: [],
    experience: '',
    injuries: '',
    preferred_times: []
  });

  const updateField = (field: keyof QuestionnaireData, value: string | string[]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArray = (field: 'fitness_goals' | 'preferred_times', value: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit');
      }

      // Redirect to booking page with client ID
      router.push(`/book?trial=true&clientId=${result.clientId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return data.name && data.email && data.phone;
      case 2:
        return data.age && data.height && data.weight;
      case 3:
        return data.fitness_goals.length > 0;
      case 4:
        return data.experience;
      case 5:
        return data.preferred_times.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Get Started</h1>
          <span className="text-sm text-gray-500">Step {step} of 5</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone *</label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+65 9123 4567"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Body Stats</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Age *</label>
            <input
              type="number"
              value={data.age}
              onChange={(e) => updateField('age', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="25"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Height (cm) *</label>
            <input
              type="number"
              value={data.height}
              onChange={(e) => updateField('height', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="175"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Weight (kg) *</label>
            <input
              type="number"
              value={data.weight}
              onChange={(e) => updateField('weight', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="70"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Fitness Goals *</h2>
          <p className="text-sm text-gray-600">Select all that apply</p>
          <div className="grid grid-cols-2 gap-2">
            {fitnessGoalsOptions.map(goal => (
              <button
                key={goal}
                onClick={() => toggleArray('fitness_goals', goal)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  data.fitness_goals.includes(goal)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Experience & Health</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Training Experience *</label>
            <select
              value={data.experience}
              onChange={(e) => updateField('experience', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="none">No experience</option>
              <option value="beginner">Beginner (less than 6 months)</option>
              <option value="intermediate">Intermediate (6 months - 2 years)</option>
              <option value="advanced">Advanced (2+ years)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Injuries or Medical Conditions</label>
            <textarea
              value={data.injuries}
              onChange={(e) => updateField('injuries', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="None, or describe any injuries/conditions I should know about..."
            />
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Preferred Training Times *</h2>
          <p className="text-sm text-gray-600">Select all that work for you</p>
          <div className="space-y-2">
            {timeOptions.map(time => (
              <button
                key={time}
                onClick={() => toggleArray('preferred_times', time)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  data.preferred_times.includes(time)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            Back
          </button>
        ) : (
          <div />
        )}
        
        {step < 5 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!isStepValid()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isStepValid() || loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Book My Free Trial'}
          </button>
        )}
      </div>
    </div>
  );
}
