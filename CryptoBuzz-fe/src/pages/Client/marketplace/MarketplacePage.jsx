import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import useDocumentTitle from '../../../hooks/use-document-title';
import { useFetchPlansQuery } from '../../../store/client/clientPlanApiSlice';
import { useGetPurchasedPlanIdsQuery, useCreatePaymentLinkMutation } from '../../../store/client/clientPaymentApiSlice';
import PlanCard from '../../../components/payment/PlanCard';
import MarketplacePlanModal from '../../../components/payment/MarketplacePlanModal';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../../../store/authSlice';
import { selectSelectedLanguage } from '../../../store/languageSlice';

export default function MarketplacePage() {
  useDocumentTitle('Marketplace');
  const navigate = useNavigate();

  // Get token from Redux state (primary) or localStorage (fallback)
  const tokenFromRedux = useSelector(selectCurrentToken);

  // Fetch active plans for marketplace
  const { data: plansResponse, isLoading: plansLoading } = useFetchPlansQuery();
  const plans = plansResponse?.data || [];

  // Get purchased plan ids to mark purchased status
  const { data: purchasedPlansData } = useGetPurchasedPlanIdsQuery(undefined, { refetchOnMountOrArgChange: true });
  const purchasedPlanIds = React.useMemo(() => {
    if (!purchasedPlansData?.data?.planIds) return new Set();
    return new Set(purchasedPlansData.data.planIds.map(id => id?.toString()));
  }, [purchasedPlansData]);

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [createPaymentLink] = useCreatePaymentLinkMutation();


  // Handle plan view / purchase flow
  const handlePlanView = (plan) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const handleModalPurchaseSuccess = (response) => {
    // Optionally handle success (e.g., track event)
    setShowPlanModal(false);
  };


  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200 mb-2">Marketplace</h1>
        <p className="text-gray-600 dark:text-gray-400">Explore all available plans</p>
      </div>

      {plansLoading ? (
        <div className="mt-6">
          <Card className="rounded-lg p-6 shadow-md text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading plans...</p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan?._id}
              plan={plan}
              purchased={purchasedPlanIds.has((plan?._id || '')?.toString())}
              onClick={handlePlanView}
            />
          ))}
        </div>
      )}

      {/* Plan modal for selected plan */}
      {selectedPlan && (
        <MarketplacePlanModal
          open={showPlanModal}
          onOpenChange={setShowPlanModal}
          plan={selectedPlan}
          useDirectPlanCheckout={true}
          onPurchaseSuccess={handleModalPurchaseSuccess}
        />
      )}
    </>
  );
}
