
import React, { useEffect } from 'react';

interface LegalViewProps {
  type: 'privacy' | 'terms';
  onClose: () => void;
}

const LegalView: React.FC<LegalViewProps> = ({ type, onClose }) => {
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const renderPrivacy = () => (
    <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
      <h3 className="text-lg font-bold text-gray-900">Privacy Policy</h3>
      <p className="text-xs text-gray-500">Last Updated: October 26, 2023</p>

      <h4 className="font-bold text-gray-900 mt-4">1. Introduction</h4>
      <p>ReliefAnchor ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we handle your data when you use our mobile application.</p>

      <h4 className="font-bold text-gray-900 mt-4">2. Data We Collect</h4>
      <p><strong>A. Local Data:</strong> Your chat history, mood logs, and journal entries are stored <strong>locally on your device</strong> via standard storage mechanisms. We do not transmit this data to our own servers or database.</p>
      <p><strong>B. AI Processing:</strong> To provide chat functionality, the text you send is transmitted securely to Google Gemini API. This data is used solely to generate a response and is not stored by us for training purposes.</p>

      <h4 className="font-bold text-gray-900 mt-4">3. Permissions</h4>
      <p>We may request access to:</p>
      <ul className="list-disc pl-5">
        <li><strong>Internet:</strong> To connect to the AI service and load resources.</li>
        <li><strong>Vibration:</strong> For haptic feedback in breathing exercises and games.</li>
      </ul>

      <h4 className="font-bold text-gray-900 mt-4">4. Third-Party Services</h4>
      <p>We use the following third-party services:</p>
      <ul className="list-disc pl-5">
        <li><strong>Google Gemini API:</strong> For natural language processing.</li>
        <li><strong>Google Play Billing:</strong> For processing subscription payments. We do not store your credit card information.</li>
      </ul>

      <h4 className="font-bold text-gray-900 mt-4">5. Data Retention</h4>
      <p>Since data is stored locally, uninstalling the app or clearing app data will result in the permanent deletion of your chat history and logs. We cannot recover this data.</p>

      <h4 className="font-bold text-gray-900 mt-4">6. Contact Us</h4>
      <p>If you have questions about this policy, please contact us at support@mindease.india.</p>
    </div>
  );

  const renderTerms = () => (
    <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
      <h3 className="text-lg font-bold text-gray-900">Terms of Service</h3>
      <p className="text-xs text-gray-500">Last Updated: October 26, 2023</p>

      <h4 className="font-bold text-gray-900 mt-4">1. Medical Disclaimer</h4>
      <p className="bg-red-50 border border-red-100 p-3 rounded-lg text-red-800 font-medium">
        ReliefAnchor is an AI-powered self-help tool. It is <strong>NOT</strong> a replacement for professional medical advice, diagnosis, or treatment. If you are in crisis, please contact emergency services immediately.
      </p>

      <h4 className="font-bold text-gray-900 mt-4">2. Acceptance of Terms</h4>
      <p>By downloading or using the app, these terms will automatically apply to you.</p>

      <h4 className="font-bold text-gray-900 mt-4">3. User Conduct</h4>
      <p>You agree not to use the app for any unlawful purpose or to harass the AI system.</p>

      <h4 className="font-bold text-gray-900 mt-4">4. Subscriptions</h4>
      <p>Premium features are available via monthly or yearly subscriptions. Payment will be charged to your Google Play Account at confirmation of purchase.</p>

      <h4 className="font-bold text-gray-900 mt-4">5. Limitation of Liability</h4>
      <p>ReliefAnchor is provided "as is." We are not liable for any damages arising from your use of the app.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center p-4 border-b border-gray-200">
        <button onClick={onClose} className="text-gray-500 hover:text-brand-600 mr-4">
          <i className="fa-solid fa-arrow-left text-lg"></i>
        </button>
        <h2 className="font-bold text-gray-800">Legal Information</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {type === 'privacy' ? renderPrivacy() : renderTerms()}
      </div>
    </div>
  );
};

export default LegalView;
