'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const packages = [
  { sessions: 1, price: 180, perSession: 180, name: 'Single Session', popular: false },
  { sessions: 5, price: 425, perSession: 85, name: 'Starter Pack', popular: false },
  { sessions: 10, price: 800, perSession: 80, name: 'Basic Pack', popular: true },
  { sessions: 20, price: 1500, perSession: 75, name: 'Pro Pack', popular: false },
  { sessions: 30, price: 2100, perSession: 70, name: 'Elite Pack', popular: false },
  { sessions: 50, price: 6000, perSession: 120, name: 'Premium Pack', popular: false },
];

export default function PackagesPageContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  const [clientData, setClientData] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetch(`/api/client/${clientId}`)
        .then(res => res.json())
        .then(data => setClientData(data));
    }
  }, [clientId]);

  const handlePurchase = (pkg: typeof packages[0]) => {
    setSelectedPackage(pkg);
    setShowPayment(true);
  };

  if (showPayment && selectedPackage) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8">
          <button 
            onClick={() => setShowPayment(false)}
            className="text-blue-600 mb-4 hover:underline"
          >
            ← Back to packages
          </button>
          
          <h1 className="text-2xl font-bold mb-4">Complete Your Purchase</h1>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="font-semibold">{selectedPackage.name}</p>
            <p className="text-2xl font-bold text-blue-600">${selectedPackage.price}</p>
            <p className="text-gray-600">{selectedPackage.sessions} sessions</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">PayNow</h3>
              <p className="text-sm text-gray-600 mb-4">
                Transfer ${selectedPackage.price} to:<br />
                <strong>UEN: TBD</strong><br />
                Reference: {clientData?.name || 'Your Name'}
              </p>
              <button 
                onClick={() => alert('Payment notification sent to Frederick. Your sessions will be added within 24 hours.')}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                I&apos;ve Made Payment
              </button>
            </div>

            <div className="p-4 border rounded-lg opacity-50">
              <h3 className="font-semibold mb-2">Credit Card (Coming Soon)</h3>
              <p className="text-sm text-gray-600">Stripe integration in progress</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Package</h1>
          <p className="text-gray-600">
            {clientData?.sessions_remaining > 0 
              ? `You have ${clientData.sessions_remaining} sessions remaining`
              : 'Select the package that fits your goals'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div 
              key={pkg.sessions}
              className={`bg-white rounded-lg shadow-lg p-6 relative ${
                pkg.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">${pkg.price}</span>
                <span className="text-gray-500"> / {pkg.sessions} sessions</span>
              </div>
              <p className="text-gray-600 mb-6">
                ${pkg.perSession} per session
              </p>
              
              <button
                onClick={() => handlePurchase(pkg)}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  pkg.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Select Package
              </button>
            </div>
          ))}
        </div>

        {clientId && (
          <div className="mt-8 text-center">
            <a 
              href={`/dashboard?clientId=${clientId}`}
              className="text-blue-600 hover:underline"
            >
              Go to My Dashboard →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
