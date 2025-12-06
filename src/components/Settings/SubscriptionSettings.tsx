// SubscriptionSettings.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";

import {
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  X,
  AlertTriangle,
  Edit,
  Crown,
  Zap,
  Building2,
} from "lucide-react";
import "../../styles/components.css";
import { apiClient } from "../../services/apiClient";
import { toast } from "react-toastify";
// adjust path to your api client

interface Subscription {
  id: string;
  planType: "basic" | "premium" | "enterprise";
  status: "active" | "expired" | "cancelled" | "trial";
  startDate: string;
  endDate: string;
  monthlyPrice: number;
  features: string[];
  paymentMethod: string;
  lastPayment?: string;
  nextBilling?: string;
  autoRenew: boolean;
  trialDaysLeft?: number;
  // optional other fields
  idPlan?: string;
}

interface PlanChangeModalProps {
  isOpen: boolean;
  currentPlanId: string | null;
  plansFromServer: any[];
  onClose: () => void;
  onConfirm: (planId: string) => void;
}

const PlanChangeModal: React.FC<PlanChangeModalProps> = ({
  isOpen,
  currentPlanId,
  plansFromServer,
  onClose,
  onConfirm,
}) => {
const [selectedPlan, setSelectedPlan] = useState<string | null>(currentPlanId);

// const PlanChangeModal({
//   isOpen,
//   currentPlanId,
//   plansFromServer,
//   onClose,
//   onConfirm,
// }: PlanChangeModalProps) {
//   const [selectedPlan, setSelectedPlan] = useState<string | null>(currentPlanId);

  if (!isOpen) return null;

  // We mimic your old "planKey" by using plan.id from backend
  const plans = plansFromServer || [];

  // ===== Determine Upgrade / Downgrade (based on price) =====
  const getPlanPrice = (id: string) =>
    plans.find((p) => p.id === id)?.planPrice || 0;

  const isUpgrade = (id: string | null) => {
    if (!id || !currentPlanId) return false;
    return getPlanPrice(id) > getPlanPrice(currentPlanId);
  };

  const isDowngrade = (id: string | null) => {
    if (!id || !currentPlanId) return false;
    return getPlanPrice(id) < getPlanPrice(currentPlanId);
  };

  const handleConfirm = () => {
    if (selectedPlan && selectedPlan !== currentPlanId) {
      onConfirm(selectedPlan);
    }
  };

  // ===== Color palette matching your old design for plans =====
  const colorMap = ["#4f46e5", "#16a34a", "#db2777", "#0ea5e9"];

  const getColor = (index: number) => colorMap[index % colorMap.length];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "900px" }}>
        <div className="modal-header">
          <h2 className="modal-title">Change Subscription Plan</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {plans.map((plan, idx) => {
              const isCurrent = currentPlanId === plan.id;
              const isSelected = selectedPlan === plan.id;
              const color = getColor(idx);

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  style={{
                    border: isSelected
                      ? `2px solid ${color}`
                      : "2px solid #202020",
                    borderRadius: "12px",
                    padding: "24px",
                    cursor: "pointer",
                    background: isSelected ? `${color}08` : "#323232",
                    transition: "all 0.2s ease",
                    position: "relative",
                  }}
                >
                  {/* === CURRENT TAG === */}
                  {isCurrent && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: color,
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: "600",
                      }}
                    >
                      CURRENT
                    </div>
                  )}

                  {/* === TITLE + PRICE === */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ color }}>{/* No icon in backend */}</div>

                    <div>
                      <h3
                        style={{
                          color: "#fff",
                          fontSize: "20px",
                          fontWeight: "700",
                          margin: 0,
                        }}
                      >
                        {plan.planName}
                      </h3>

                      <div style={{ color: "#A5A5A5", fontSize: "14px" }}>
                        ${plan.planPrice}/{plan.isMonthly ? "month" : "year"}
                      </div>
                    </div>
                  </div>

                  {/* === FEATURES === */}
                  <div style={{ marginBottom: "20px" }}>
                    {(plan.features || []).map((feature: string, index: number) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                          fontSize: "13px",
                          color: "#A5A5A5",
                        }}
                      >
                        <CheckCircle size={14} style={{ color }} />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* === Selected Highlight === */}
                  {isSelected && (
                    <div
                      style={{
                        padding: "12px",
                        background: `${color}15`,
                        borderRadius: "8px",
                        border: `1px solid ${color}30`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          color,
                          fontWeight: "600",
                        }}
                      >
                        {isCurrent
                          ? "Current Plan"
                          : isUpgrade(plan.id)
                          ? "Upgrade Selected"
                          : isDowngrade(plan.id)
                          ? "Downgrade Selected"
                          : "Plan Selected"}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* === Upgrade / Downgrade Warning Box === */}
          {selectedPlan !== currentPlanId && selectedPlan && (
            <div
              style={{
                marginTop: "24px",
                padding: "16px",
                background: isUpgrade(selectedPlan) ? "#f0f9ff" : "#fef3c7",
                borderRadius: "8px",
                border: `1px solid ${
                  isUpgrade(selectedPlan) ? "#bae6fd" : "#fde68a"
                }`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  color: isUpgrade(selectedPlan) ? "#0369a1" : "#92400e",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                {isUpgrade(selectedPlan) ? (
                  <Zap size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
                {isUpgrade(selectedPlan) ? "Plan Upgrade" : "Plan Downgrade"}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: isUpgrade(selectedPlan) ? "#0369a1" : "#92400e",
                }}
              >
                {isUpgrade(selectedPlan)
                  ? `You'll be charged the prorated difference immediately and your next billing cycle will be at the new rate.`
                  : `Your plan will be downgraded at the end of your current billing cycle. You'll continue to have access to current features until then.`}
              </div>
            </div>
          )}
        </div>

        {/* === FOOTER === */}
        <div className="modal-footer">
          <button className="btn btn-secondary-outlined" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary"
            disabled={!selectedPlan || selectedPlan === currentPlanId}
            onClick={handleConfirm}
          >
            {isUpgrade(selectedPlan)
              ? "Upgrade Plan"
              : isDowngrade(selectedPlan)
              ? "Downgrade Plan"
              : "Confirm Change"}
          </button>
        </div>
      </div>
    </div>
  );
}

const SubscriptionSettings: React.FC = () => {
  const { user, setUser /* optional if your context exposes setter */ } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Additional mobile-like state
  const [expanded, setExpanded] = useState(false);
  const [plan, setPlan] = useState<any | null>(null);
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: string; message: string } | null>(null);
  const [availablePlans, setAvailablePlans] = useState<any[] | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${date.toLocaleString("default", { month: "long" })} ${date.getDate()}, ${date.getFullYear()}`;
  };

  useEffect(() => {
    fetchClubDetails();
    loadSubscriptionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSubscriptionData = async () => {
  try {
    setLoadingPlans(true);

    // 1. Get current subscription  
    // const subRes = await apiClient.getCurrentSubscription(user?.club?.id);
    // setSubscription(subRes?.data || null);

    // 2. Get all available plans  
    const plansRes = await apiClient.getAllPlans();
    setAvailablePlans(plansRes?.payLoad || []);

  } catch (err) {
    console.log("Error loading subscription:", err);
  } finally {
    setLoadingPlans(false);
  }
};

  const fetchClubDetails = async () => {
    try {
      setLoading(true);
      // Support multiple response shapes
      debugger
      const club = user.club

      if (club) {
        const c = club;
        setClubId(c.id ?? c._id ?? null);

        // set plan & subscription mapping
        const subscribedPlan = c.subscribedPlan ?? null;

        const mappedSub: Subscription | null = subscribedPlan
          ? {
              id: subscribedPlan.id ?? subscribedPlan._id ?? "plan-" + (c.id ?? "0"),
              planType: (subscribedPlan.planName ?? subscribedPlan.planType ?? "premium").toLowerCase() as any,
              status: c.isSubscriptionExpired ? "expired" : "active",
              startDate: c.subscriptionStartDate ?? c.subscriptionStartDateString ?? new Date().toISOString(),
              endDate: c.subscriptionExpiryDate ?? c.subscriptionExpiryDateString ?? new Date().toISOString(),
              monthlyPrice: subscribedPlan.planPrice ?? subscribedPlan.price ?? 0,
              features: subscribedPlan.features ?? (subscribedPlan.description ? [subscribedPlan.description] : []),
              paymentMethod: subscribedPlan.paymentMethod ?? "N/A",
              lastPayment: c.lastPayment ?? null,
              nextBilling: c.subscriptionExpiryDate ?? c.subscriptionExpiryDateString ?? null,
              autoRenew: c.autoRenewalEnabled ?? c.autoRenewal ?? false,
              idPlan: subscribedPlan.id ?? subscribedPlan._id ?? null,
            }
          : null;
        setSubscription(mappedSub);
        setPlan(subscribedPlan ?? null);

        if (c.subscriptionExpiryDate) setRenewalDate(new Date(c.subscriptionExpiryDate));
        else if (c.subscriptionExpiryDateString) setRenewalDate(new Date(c.subscriptionExpiryDateString));
        else setRenewalDate(null);

        // update user in context/local storage if provided (mirror mobile logic)
        // try {
        //   if (setUser && typeof setUser === "function") {
        //     const updatedUser = { ...(user ?? {}), club: c };
        //     setUser(updatedUser);
        //   }
        // } catch (e) {
        //   // ignore if context doesn't provide setter
        // }

        // fetch auto-renewal enabled status from stripe endpoint
        try {
          const ar = apiClient?.getAutoRenewalStatus ? await apiClient.getAutoRenewalStatus(c.id) : await fetch(`/stripe/autoRenewal/${c.id}`).then(r => r.json());
          const enabled = ar?.data?.payLoad?.enabled ?? ar?.payLoad?.enabled ?? ar?.data?.enabled ?? ar?.enabled ?? false;
          if (mappedSub) setSubscription(prev => prev ? { ...prev, autoRenew: enabled } : prev);
          if (!enabled) {
            setStatusBanner({
              type: "cancel",
              message: `Your subscription is set to expire on ${formatDate(c.subscriptionExpiryDate || c.subscriptionExpiryDateString)}`,
            });
          } else {
            setStatusBanner(null);
          }
        } catch (err) {
          console.warn("autoRenewal fetch failed:", err);
        }

        // fetch scheduled plan (if any)
        //await fetchScheduledPlan(c, subscribedPlan);
        // set available plans if provided by club
        if (Array.isArray(c.availablePlans) && c.availablePlans.length > 0) {
          setAvailablePlans(c.availablePlans);
        }
      }
    } catch (err) {
      console.error("fetchClubDetails error:", err);
      alert("Unable to fetch club details. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduledPlan = async (club: any, currentPlan: any) => {
    if (!club?.id) return;
    try {
      const scheduledRes = apiClient?.getScheduledPlan ? await apiClient.getScheduledPlan(club.id) : await fetch(`/stripe/scheduledPlan/${club.id}`).then(r => r.json());
      const payload = scheduledRes?.data?.payLoad ?? scheduledRes?.payLoad ?? scheduledRes?.data ?? scheduledRes;
      const scheduledPlan = payload?.plan ?? null;
      const effectiveDate = payload?.effectiveDate ?? payload?.effectiveDateString ?? null;

      if (scheduledPlan) {
        const scheduledAmount = Number(scheduledPlan.planPrice ?? scheduledPlan.amount ?? 0);
        const currentAmount = Number(currentPlan?.planPrice ?? currentPlan?.amount ?? 0);
        if (statusBanner?.type !== "cancel") {
          if (scheduledAmount > currentAmount) {
            setStatusBanner({
              type: "upgrade",
              message: `Your plan will be upgraded to ${scheduledPlan.planName} on ${formatDate(effectiveDate)}`,
            });
          } else if (scheduledAmount < currentAmount) {
            setStatusBanner({
              type: "downgrade",
              message: `Your plan will be downgraded to ${scheduledPlan.planName} on ${formatDate(effectiveDate)}`,
            });
          }
        }
      }
    } catch (err) {
      console.warn("scheduledPlan fetch failed:", err);
    }
  };

  const toggleAutoRenew = async () => {
    if (!clubId) {
      alert("Club not found");
      return;
    }
    try {
      setLoading(true);
      const enabled = !(subscription?.autoRenew ?? false);
      let res;
      if (apiClient?.toggleAutoRenewal) {
        res = await apiClient.toggleAutoRenewal(clubId, enabled);
      } else {
        res = await fetch("/stripe/toggleAutoRenewal", { method: "POST", body: JSON.stringify({ clubId, enabled }) }).then(r => r.json());
      }

      const success = res?.data?.status === "Success" || res?.status === "Success" || res?.success || res?.data?.success;
      if (success) {
        setSubscription(prev => (prev ? { ...prev, autoRenew: enabled } : prev));
        alert(`Auto-renewal ${enabled ? "enabled" : "disabled"} successfully`);
        await fetchClubDetails();
      } else {
        alert("Failed to update auto-renewal");
      }
    } catch (err) {
      console.error("toggleAutoRenewal error:", err);
      alert("Error updating auto-renewal. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Plan change handler - this will be called by PlanChangeModal onConfirm
  // const handlePlanChange = async (newPlanKey: "basic" | "premium" | "enterprise", planId?: string) => {
  //   if (!clubId) {
  //     alert("Club not found");
  //     return;
  //   }

  //   // determine upgrade/downgrade: compare new plan price with current price if available
  //   const currentPrice = Number(subscription?.monthlyPrice ?? 0);
  //   // try to find price from availablePlans or fallback to static
  //   let newPrice = 0;
  //   if (availablePlans && planId) {
  //     const found = availablePlans.find(p => p.id === planId || p.id?.toString() === planId?.toString() || (p.planName ?? "").toLowerCase() === newPlanKey);
  //     newPrice = Number(found?.planPrice ?? found?.price ?? 0);
  //   } else {
  //     const map: any = { basic: 99, premium: 199, enterprise: 399 };
  //     newPrice = map[newPlanKey] ?? 0;
  //   }

  //   const isUpgrade = newPrice > currentPrice;

  //   if (isUpgrade) {
  //     // Mobile navigates to Upgrade settings screen for immediate upgrade/checkout.
  //     // On web, you likely redirect to your payment/upgrade flow — replace the line below with your route.
  //     // We will open a placeholder upgrade flow route. Adjust as needed.
  //     window.location.href = `/upgrade?clubId=${clubId}&plan=${encodeURIComponent(newPlanKey)}${planId ? `&planId=${planId}` : ""}`;
  //     return;
  //   }

  //   // Downgrade flow -> schedule change (like mobile)
  //   try {
  //     setLoading(true);
  //     // API: stripe/changeAutoRenewalPlan
  //     let res;
  //     if (apiClient?.changeAutoRenewalPlan) {
  //       res = await apiClient.changeAutoRenewalPlan(clubId, planId ?? newPlanKey);
  //     } else {
  //       res = await fetch("/stripe/changeAutoRenewalPlan", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ clubId, planId: planId ?? newPlanKey }),
  //       }).then(r => r.json());
  //     }

  //     const ok = res?.data?.status === "Success" || res?.status === "Success" || res?.success || res?.data?.success;
  //     if (ok) {
  //       // update UI to reflect scheduled plan change
  //       alert("Plan scheduled for next cycle.");
  //       // re-fetch to show scheduled plan banner
  //       await fetchClubDetails();
  //     } else {
  //       console.error("changeAutoRenewalPlan response:", res);
  //       alert("Unable to change plan. Try again.");
  //     }
  //   } catch (err) {
  //     console.error("confirmChangePlan error:", err);
  //     alert("Unable to change plan. Try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handlePlanChange = async (selectedPlanId: string) => {
  try {
    toast.loading("Updating subscription...");

    await apiClient.changeSubscriptionPlan(user.club.id, selectedPlanId);

    toast.dismiss();
    toast.success("Subscription updated!");

    setShowPlanChangeModal(false);

    // Refresh subscription details
    await loadSubscriptionData();

  } catch (error) {
    toast.dismiss();
    toast.error("Failed to update plan");
    console.log("change plan error:", error);
  }
};


  // Cancel subscription (toggle auto-renew to false and mark cancelled locally)
  const handleCancelSubscription = async () => {
    if (!clubId) {
      alert("Club not found");
      return;
    }

    // confirm already happened in UI modal; perform toggle and update status
    try {
      setLoading(true);
      let res;
      if (apiClient?.toggleAutoRenewal) {
        res = await apiClient.toggleAutoRenewal(clubId, false);
      } else {
        res = await fetch("/stripe/toggleAutoRenewal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clubId, enabled: false }),
        }).then(r => r.json());
      }
      const ok = res?.data?.status === "Success" || res?.status === "Success" || res?.success || res?.data?.success;
      if (ok) {
        // reflect cancellation locally
        setSubscription(prev => (prev ? { ...prev, status: "cancelled", autoRenew: false } : prev));
        setShowCancelModal(false);
        alert("Subscription cancelled. You will continue to have access until your current billing period ends.");
        await fetchClubDetails();
      } else {
        alert("Failed to cancel subscription. Try again.");
      }
    } catch (err) {
      console.error("handleCancelSubscription error:", err);
      alert("Error cancelling subscription. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "badge-success";
      case "trial":
        return "badge-info";
      case "expired":
        return "badge-danger";
      case "cancelled":
        return "badge-warning";
      default:
        return "badge-info";
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "basic":
        return <CreditCard size={20} style={{ color: "#3b82f6" }} />;
      case "premium":
        return <Crown size={20} style={{ color: "#f59e0b" }} />;
      case "enterprise":
        return <Building2 size={20} style={{ color: "#10b981" }} />;
      default:
        return <CreditCard size={20} />;
    }
  };

  const isSubscriptionExpiringSoon = () => {
    if (!subscription?.endDate) return false;
    const expiry = new Date(subscription.endDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry <= thirtyDaysFromNow && expiry > today;
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  if (!subscription) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Subscription</h2>
          <p className="card-subtitle">No active subscription found</p>
        </div>
        <div className="empty-state">
          <CreditCard size={48} style={{ color: "#9ca3af", margin: "0 auto 16px" }} />
          <div className="empty-state-title">No Active Subscription</div>
          <div className="empty-state-description">Contact support to set up your subscription plan</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Subscription Management</h2>
          <p className="card-subtitle">Manage your subscription plan and billing</p>
        </div>

        {/* Status banner from scheduled plan/ cancel */}
        {statusBanner && (
          <div
            style={{
              margin: "16px 24px",
            }}
          >
            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background:
                  statusBanner.type === "cancel" ? "#fee2e2" : statusBanner.type === "downgrade" ? "#fff7ed" : "#f0f9ff",
                border:
                  statusBanner.type === "cancel"
                    ? "1px solid #fca5a5"
                    : statusBanner.type === "downgrade"
                    ? "1px solid #fcd34d"
                    : "1px solid #bae6fd",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {statusBanner.type === "cancel"
                    ? "Cancellation in Progress"
                    : statusBanner.type === "downgrade"
                    ? "Package Downgrade Scheduled"
                    : "Package Upgrade Scheduled"}
                </div>
                <div style={{ color: "#374151" }}>{statusBanner.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan Overview */}
        <div
          style={{
            padding: "24px",
            background: "linear-gradient(90deg, #00E7BE -53.42%, #076955 100%)",
            borderRadius: "12px",
            color: "white",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {getPlanIcon(subscription.planType)}
              <div>
                <h3 style={{ fontSize: "24px", fontWeight: "700", margin: 0, color: "white" }}>
                  {subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1)} Plan
                </h3>
                <div style={{ fontSize: "16px", opacity: 0.9 }}>${subscription.monthlyPrice}/month</div>
              </div>
            </div>
            <span className={`badge ${getStatusBadgeClass(subscription.status)}`}>{subscription.status}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>BILLING CYCLE</div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>
                {new Date(subscription.startDate).toLocaleDateString()} - {new Date(subscription.endDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>NEXT BILLING</div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>
                {subscription.nextBilling ? new Date(subscription.nextBilling).toLocaleDateString() : "N/A"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>PAYMENT METHOD</div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>{subscription.paymentMethod}</div>
            </div>
          </div>

          {isSubscriptionExpiringSoon() && subscription.status === "active" && (
            <div style={{ marginTop: "16px", padding: "12px", background: "rgba(255, 255, 255, 0.2)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={16} />
              <span style={{ fontSize: "13px" }}>Your subscription expires soon. Make sure auto-renewal is enabled to avoid service interruption.</span>
            </div>
          )}
        </div>

        {/* Plan Features */}
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Current Plan Features</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
            {subscription.features.map((feature, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px",
                  background: "#11111",
                  borderRadius: "6px",
                  fontSize: "13px",
                  color: "#fff",
                  border: "1px solid #323232",
                }}
              >
                <CheckCircle size={14} style={{ color: "#10b981" }} />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Billing Information */}
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Billing Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Last Payment</label>
              <div style={{ fontSize: "14px", color: "#878787" }}>{subscription.lastPayment ? new Date(subscription.lastPayment).toLocaleDateString() : "N/A"}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Auto Renewal</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={subscription.autoRenew} onChange={() => toggleAutoRenew()} style={{ accentColor: "#878787" }} />
                  <span style={{ fontSize: "14px", color: "#878787" }}>{subscription.autoRenew ? "Enabled" : "Disabled"}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => setShowPlanChangeModal(true)}>
            <Edit size={16} />
            Change Plan
          </button>

          {subscription.status === "active" && (
            <button className="btn btn-cancel" onClick={() => setShowCancelModal(true)}>
              Cancel Subscription
            </button>
          )}
        </div>
      </div>

      {/* Plan Change Modal */}
      {showPlanChangeModal && (
        <PlanChangeModal
          isOpen={showPlanChangeModal}
          currentPlanId={subscription?.idPlan || null}
          currentPlanName={subscription?.planType || null}
          plansFromServer={availablePlans}
          onClose={() => setShowPlanChangeModal(false)}
          onConfirm={handlePlanChange}
        />

      )}


      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Cancel Subscription</h2>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ padding: "16px", background: "#2C2C2C", borderRadius: "8px", border: "1px solid #2C2C2C", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <AlertTriangle size={16} style={{ color: "#dc2626" }} />
                  <strong style={{ color: "#dc2626" }}>Are you sure you want to cancel?</strong>
                </div>
                <div style={{ fontSize: "13px", color: "#A5A5A5" }}>
                  You will lose access to all premium features at the end of your current billing cycle ({new Date(subscription.endDate).toLocaleDateString()}).
                </div>
              </div>

              <p style={{ color: "#A5A5A5", fontSize: "14px" }}>
                Your subscription will remain active until {new Date(subscription.endDate).toLocaleDateString()}, and you'll continue to have access to all features until then.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary-outlined" onClick={() => setShowCancelModal(false)}>
                Keep Subscription
              </button>
              <button className="btn btn-cancel" onClick={handleCancelSubscription}>
                Yes, Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSettings;
