import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

const RejectModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!remarks.trim()) {
      setError('Rejection remarks are required');
      return;
    }

    if (remarks.trim().length < 10) {
      setError('Please provide detailed remarks (at least 10 characters)');
      return;
    }

    onSubmit(remarks);
    setRemarks('');
    setError('');
  };

  const handleClose = () => {
    setRemarks('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Submission"
      size="md"
    >
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-rose-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-rose-800">Important</h4>
              <p className="text-sm text-rose-700 mt-1">
                The student will be notified and will need to resubmit their data.
                Please provide clear and constructive feedback.
              </p>
            </div>
          </div>
        </div>

        {/* Remarks Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Remarks <span className="text-rose-600">*</span>
          </label>
          <textarea
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              setError('');
            }}
            rows={5}
            className={`
              block w-full px-4 py-3 border rounded-lg
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              ${error ? 'border-rose-300' : 'border-gray-300'}
            `}
            placeholder="Explain clearly why this submission is being rejected and what the student needs to correct..."
          />
          {error && (
            <p className="mt-2 text-sm text-rose-600">{error}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Character count: {remarks.length} (minimum 10 required)
          </p>
        </div>

        {/* Example Remarks */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Example remarks:</p>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Attendance certificate is missing for the current semester</li>
            <li>Course marks verification pending - contact department office</li>
            <li>Co-curricular activity certificates need proper signatures</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RejectModal;