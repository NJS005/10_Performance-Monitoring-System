import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const ApprovalActions = ({ onApprove, onReject, isLoading }) => {
  return (
    <Card className="p-6 bg-gradient-to-r from-gray-50 to-indigo-50 border-2 border-indigo-100">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ready to Review?</h3>
          <p className="text-sm text-gray-600 mt-1">
            Approve this submission or reject with detailed remarks
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="danger"
            size="lg"
            onClick={onReject}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject
          </Button>
          <Button
            variant="success"
            size="lg"
            onClick={onApprove}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Approve
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ApprovalActions;