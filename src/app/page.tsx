import QuestionnaireForm from '@/components/QuestionnaireForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Personal Training with Frederick</h1>
        <p className="text-gray-600">Transform your fitness journey with personalized training</p>
      </div>
      <QuestionnaireForm />
    </main>
  );
}
