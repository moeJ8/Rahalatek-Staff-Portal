import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card } from "flowbite-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  HiChevronDown,
  HiChevronUp,
  HiDownload,
  HiFilter,
  HiRefresh,
  HiSearch,
  HiX,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import CustomTooltip from "../components/CustomTooltip";
import Search from "../components/Search";
import Select from "../components/Select";
import SearchableSelect from "../components/SearchableSelect";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomButton from "../components/CustomButton";
import CustomScrollbar from "../components/CustomScrollbar";
import RahalatekLoader from "../components/RahalatekLoader";
import PaymentDateControls from "../components/PaymentDateControls";

const getCurrencySymbol = (currency) => {
  if (!currency) return "$";
  const map = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "د.إ",
    SAR: "ر.س",
    TRY: "₺",
    EGP: "ج.م",
  };
  return map[currency] || currency || "$";
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const PaymentInfoRow = ({ label, value }) => {
  const displayValue =
    value === null || value === undefined || value === "" ? "N/A" : value;
  const isElement = React.isValidElement(displayValue);

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      {isElement ? (
        <div className="mt-0.5">{displayValue}</div>
      ) : (
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {displayValue}
        </p>
      )}
    </div>
  );
};

const getCurrentYearValue = () => new Date().getFullYear().toString();

const getCurrentMonthValue = () =>
  String(new Date().getMonth() + 1).padStart(2, "0");

const formatMonthLabel = (value, year) => {
  if (!value) return "All Months";
  const numericYear = Number(year) || new Date().getFullYear();
  const numericMonth = Number(value);
  if (!numericMonth) return value;
  const date = new Date(numericYear, numericMonth - 1, 1);
  return `${date.toLocaleString("default", {
    month: "long",
  })} ${numericYear}`;
};

const PaymentsPage = () => {
  const navigate = useNavigate();
  const defaultCreatedMonthRef = useRef(getCurrentMonthValue());
  const defaultCreatedYearRef = useRef(getCurrentYearValue());
  const userRoles = useMemo(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        isAdmin: !!storedUser.isAdmin,
        isAccountant: !!storedUser.isAccountant,
      };
    } catch (error) {
      console.error("Failed to parse user info", error);
      return { isAdmin: false, isAccountant: false };
    }
  }, []);
  const canEditPaymentDate = userRoles.isAdmin || userRoles.isAccountant;
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [showMobileFilterModal, setShowMobileFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "approved",
    currency: "",
    office: "",
    client: "",
    createdBy: "",
    approvedBy: "",
    dateFrom: "",
    dateTo: "",
    createdYear: defaultCreatedYearRef.current,
    createdMonth: defaultCreatedMonthRef.current,
  });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (filters.status) {
        params.set("status", filters.status);
      }

      const selectedYear =
        Number(filters.createdYear) || Number(defaultCreatedYearRef.current);

      if (filters.createdMonth) {
        const monthIndex = Number(filters.createdMonth) - 1;
        if (!Number.isNaN(monthIndex)) {
          const startDate = new Date(selectedYear, monthIndex, 1);
          const endDate = new Date(selectedYear, monthIndex + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          params.set("startDate", startDate.toISOString());
          params.set("endDate", endDate.toISOString());
        }
      } else if (filters.createdYear) {
        const startDate = new Date(selectedYear, 0, 1);
        const endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999);
        params.set("startDate", startDate.toISOString());
        params.set("endDate", endDate.toISOString());
      }

      const query = params.toString();
      const response = await axios.get(
        `/api/office-payments${query ? `?${query}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPayments(response.data?.data || []);
    } catch (error) {
      console.error("Failed to load payments", error);
      toast.error("Failed to load payments", {
        duration: 3000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#f44336",
        },
      });
    } finally {
      setLoading(false);
    }
  }, [
    filters.status,
    filters.createdMonth,
    filters.createdYear,
    defaultCreatedYearRef,
  ]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const currencies = useMemo(
    () =>
      Array.from(
        new Set(payments.map((payment) => payment.currency).filter(Boolean))
      ),
    [payments]
  );

  const createdByUsers = useMemo(
    () =>
      Array.from(
        new Map(
          payments
            .filter((payment) => payment.createdBy)
            .map((payment) => [
              payment.createdBy._id,
              {
                id: payment.createdBy._id,
                name: payment.createdBy.name || payment.createdBy.username,
              },
            ])
        ).values()
      ),
    [payments]
  );

  const createdByMap = useMemo(() => {
    const map = new Map();
    createdByUsers.forEach((user) =>
      map.set(user.id, user.name || user.username || "N/A")
    );
    return map;
  }, [createdByUsers]);

  const approvedByUsers = useMemo(
    () =>
      Array.from(
        new Map(
          payments
            .filter((payment) => payment.approvedBy)
            .map((payment) => [
              payment.approvedBy._id,
              {
                id: payment.approvedBy._id,
                name: payment.approvedBy.name || payment.approvedBy.username,
              },
            ])
        ).values()
      ),
    [payments]
  );

  const availableYears = useMemo(() => {
    const yearSet = new Set();
    payments.forEach((payment) => {
      if (payment.createdAt) {
        const year = new Date(payment.createdAt).getFullYear();
        if (!Number.isNaN(year)) {
          yearSet.add(year);
        }
      }
    });

    if (yearSet.size === 0) {
      yearSet.add(Number(defaultCreatedYearRef.current));
    }

    const maxYear = Math.max(...yearSet);
    yearSet.add(maxYear + 1);

    const years = Array.from(yearSet)
      .sort((a, b) => b - a)
      .map((year) => year.toString());

    return years;
  }, [payments, defaultCreatedYearRef]);

  const yearOptions = useMemo(
    () => availableYears.map((year) => ({ value: year, label: year })),
    [availableYears]
  );

  const monthOptions = useMemo(() => {
    const options = [{ value: "", label: "All Months" }];
    const selectedYear =
      Number(filters.createdYear) || new Date().getFullYear();

    for (let month = 12; month >= 1; month--) {
      const value = String(month).padStart(2, "0");
      options.push({
        value,
        label: formatMonthLabel(value, selectedYear),
      });
    }

    return options;
  }, [filters.createdYear]);

  const approvedByMap = useMemo(() => {
    const map = new Map();
    approvedByUsers.forEach((user) =>
      map.set(user.id, user.name || user.username || "N/A")
    );
    return map;
  }, [approvedByUsers]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      type: "",
      status: "approved",
      currency: "",
      office: "",
      client: "",
      createdBy: "",
      approvedBy: "",
      dateFrom: "",
      dateTo: "",
      createdYear: defaultCreatedYearRef.current,
      createdMonth: defaultCreatedMonthRef.current,
    });
  };

  const applyFilters = useCallback(
    (data, overrideFilters) => {
      const currentFilters = overrideFilters || filters;

      return data.filter((payment) => {
        if (currentFilters.type && payment.type !== currentFilters.type)
          return false;
        if (currentFilters.status && payment.status !== currentFilters.status)
          return false;
        if (
          currentFilters.currency &&
          payment.currency !== currentFilters.currency
        )
          return false;
        if (
          currentFilters.office &&
          payment.officeName !== currentFilters.office
        )
          return false;
        if (
          currentFilters.client &&
          payment.relatedVoucher?.clientName !== currentFilters.client
        )
          return false;
        if (
          currentFilters.createdBy &&
          payment.createdBy?._id !== currentFilters.createdBy
        )
          return false;
        if (
          currentFilters.approvedBy &&
          payment.approvedBy?._id !== currentFilters.approvedBy
        )
          return false;
        if (currentFilters.search?.trim()) {
          const query = currentFilters.search.toLowerCase();
          const haystack = [
            payment.officeName,
            payment.notes,
            payment.relatedVoucher?.clientName,
            payment.relatedVoucher?.voucherNumber?.toString(),
            payment._id,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        if (currentFilters.dateFrom) {
          const created = new Date(payment.createdAt);
          const from = new Date(currentFilters.dateFrom);
          if (created < from) return false;
        }
        if (currentFilters.dateTo) {
          const created = new Date(payment.createdAt);
          const to = new Date(currentFilters.dateTo);
          to.setHours(23, 59, 59, 999);
          if (created > to) return false;
        }
        return true;
      });
    },
    [filters]
  );

  const filteredPayments = useMemo(
    () => applyFilters(payments),
    [payments, applyFilters]
  );

  const linkClasses =
    "text-blue-600 dark:text-teal-300 font-semibold hover:underline focus:outline-none transition-colors";

  const activeFilterLabels = useMemo(() => {
    const labels = [];

    if (filters.search.trim()) {
      labels.push({
        key: "search",
        label: "Search",
        value: `"${filters.search.trim()}"`,
      });
    }

    if (filters.type) {
      labels.push({
        key: "type",
        label: "Payment Type",
        value:
          filters.type === "INCOMING"
            ? "Incoming"
            : filters.type === "OUTGOING"
            ? "Outgoing"
            : filters.type,
      });
    }

    if (filters.status) {
      labels.push({
        key: "status",
        label: "Status",
        value: filters.status.charAt(0).toUpperCase() + filters.status.slice(1),
        isDefault: filters.status === "approved",
      });
    }

    if (filters.currency) {
      labels.push({
        key: "currency",
        label: "Currency",
        value: `${filters.currency} (${getCurrencySymbol(filters.currency)})`,
      });
    }

    if (filters.office) {
      labels.push({
        key: "office",
        label: "Supplier / Office",
        value: filters.office,
      });
    }

    if (filters.client) {
      labels.push({
        key: "client",
        label: "Client",
        value: filters.client,
      });
    }

    if (filters.createdBy) {
      labels.push({
        key: "createdBy",
        label: "Created By",
        value: createdByMap.get(filters.createdBy) || "N/A",
      });
    }

    if (filters.approvedBy) {
      labels.push({
        key: "approvedBy",
        label: "Approved By",
        value: approvedByMap.get(filters.approvedBy) || "N/A",
      });
    }

    if (filters.createdYear) {
      labels.push({
        key: "createdYear",
        label: "Created Year",
        value: filters.createdYear,
        isDefault: filters.createdYear === defaultCreatedYearRef.current,
      });
    }

    if (filters.createdMonth !== undefined && filters.createdMonth !== null) {
      const monthLabel =
        monthOptions.find((option) => option.value === filters.createdMonth)
          ?.label ||
        formatMonthLabel(filters.createdMonth, filters.createdYear);
      labels.push({
        key: "createdMonth",
        label: "Created Month",
        value: monthLabel,
        isDefault: filters.createdMonth === defaultCreatedMonthRef.current,
      });
    }

    if (filters.dateFrom) {
      labels.push({
        key: "dateFrom",
        label: "Date From",
        value: formatDate(filters.dateFrom),
      });
    }

    if (filters.dateTo) {
      labels.push({
        key: "dateTo",
        label: "Date To",
        value: formatDate(filters.dateTo),
      });
    }

    return labels;
  }, [
    filters,
    createdByMap,
    approvedByMap,
    monthOptions,
    defaultCreatedYearRef,
    defaultCreatedMonthRef,
  ]);

  const hasActiveFilters = useMemo(
    () => activeFilterLabels.some((label) => !label.isDefault),
    [activeFilterLabels]
  );

  const offices = useMemo(() => {
    const data = applyFilters(payments, { ...filters, office: "" });
    return Array.from(
      new Set(
        data
          .map((payment) => payment.officeName)
          .filter((name) => !!name?.trim())
      )
    );
  }, [payments, filters, applyFilters]);

  const clients = useMemo(() => {
    const data = applyFilters(payments, { ...filters, client: "" });
    return Array.from(
      new Set(
        data
          .map((payment) => payment.relatedVoucher?.clientName)
          .filter((name) => !!name?.trim())
      )
    );
  }, [payments, filters, applyFilters]);

  const handleDownloadReceipt = async (payment) => {
    if (!payment?._id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to download receipts", {
        duration: 3000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#f44336",
        },
      });
      return;
    }

    setDownloadingReceiptId(payment._id);
    try {
      const response = await axios.get(
        `/api/office-payments/payment/${payment._id}/receipt`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      const filename = `payment-receipt-${payment._id}.pdf`;
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download payment receipt:", error);
      toast.error(
        error.response?.data?.message || "Failed to download receipt",
        {
          duration: 3000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        }
      );
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  const handlePaymentDateUpdate = useCallback(
    async (paymentId, paymentDate) => {
      if (!paymentId) return;
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to update payment dates", {
          duration: 3000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        });
        throw new Error("Not authenticated");
      }

      try {
        await axios.patch(
          `/api/office-payments/${paymentId}/payment-date`,
          { paymentDate },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Payment date updated successfully", {
          duration: 2500,
          style: {
            background: "#4CAF50",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "15px",
            padding: "14px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#4CAF50",
          },
        });
        await fetchPayments();
      } catch (error) {
        console.error("Failed to update payment date:", error);
        toast.error(
          error.response?.data?.message || "Failed to update payment date",
          {
            duration: 3000,
            style: {
              background: "#f44336",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "16px",
              padding: "16px",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#f44336",
            },
          }
        );
        throw error;
      }
    },
    [fetchPayments]
  );

  const canViewPage = canEditPaymentDate;

  if (!canViewPage) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Card className="text-center dark:bg-slate-950">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Restricted Access
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            You do not have permission to view the payments dashboard.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Payments Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Review all supplier/client payments with comprehensive filters.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CustomButton
            variant="orange"
            icon={HiRefresh}
            onClick={fetchPayments}
            title="Refresh payments list"
          >
            Refresh
          </CustomButton>
          {hasActiveFilters ? (
            <CustomButton
              variant="red"
              icon={HiX}
              onClick={handleClearFilters}
              title="Clear filters"
            >
              Clear Filters
            </CustomButton>
          ) : null}
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setIsFiltersOpen((prev) => !prev)}
          className="w-full px-4 py-3 bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 w-full">
            <div className="flex flex-wrap items-center gap-2 text-gray-900 dark:text-white font-semibold">
              <HiFilter className="text-blue-600 dark:text-yellow-400 text-lg" />
              <span>Filters</span>
              {!isFiltersOpen && activeFilterLabels.length > 0 && (
                <button
                  type="button"
                  className="sm:hidden text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-500/15 text-blue-500 border border-blue-400/40 shadow-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMobileFilterModal(true);
                  }}
                >
                  {activeFilterLabels.length} filter
                  {activeFilterLabels.length !== 1 ? "s" : ""} applied
                </button>
              )}
              {!isFiltersOpen && activeFilterLabels.length > 0 && (
                <div className="hidden sm:flex flex-wrap items-center gap-2">
                  {activeFilterLabels.slice(0, 4).map((item) => (
                    <div
                      key={`${item.key}-collapsed`}
                      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] ${
                        item.isDefault
                          ? "bg-gray-100 dark:bg-slate-900/40 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200"
                          : "bg-blue-50/70 dark:bg-blue-900/30 border-blue-200/80 dark:border-blue-800/60 text-blue-900 dark:text-blue-100"
                      }`}
                    >
                      <span
                        className={`uppercase font-semibold tracking-wide text-[10px] ${
                          item.isDefault
                            ? "text-gray-500 dark:text-gray-400"
                            : "text-blue-500 dark:text-blue-300"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.value}
                      </span>
                    </div>
                  ))}
                  {activeFilterLabels.length > 4 && (
                    <CustomTooltip
                      title="Active Filters"
                      content={activeFilterLabels
                        .slice(4)
                        .map((item) => `${item.label}: ${item.value}`)
                        .join(" • ")}
                    >
                      <span className="text-[11px] text-blue-500 dark:text-blue-300 font-semibold px-2 py-1 rounded-full bg-blue-50/70 dark:bg-blue-900/30 border border-blue-200/80 dark:border-blue-800/60 cursor-help">
                        +{activeFilterLabels.length - 4} more
                      </span>
                    </CustomTooltip>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center">
              {isFiltersOpen ? (
                <HiChevronUp className="text-gray-600 dark:text-gray-400 text-lg" />
              ) : (
                <HiChevronDown className="text-gray-600 dark:text-gray-400 text-lg" />
              )}
            </div>
          </div>
        </button>
      </div>

      <div
        className={`mb-6 origin-top transition-all duration-200 ease-out ${
          isFiltersOpen
            ? "max-h-[1500px] opacity-100 scale-y-100 overflow-visible"
            : "max-h-0 opacity-0 scale-y-95 pointer-events-none overflow-hidden"
        }`}
      >
        <Card className="dark:bg-slate-950">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {activeFilterLabels.length > 0 && (
              <div className="xl:col-span-3">
                <div className="flex flex-wrap gap-2">
                  {activeFilterLabels.map((item) => (
                    <div
                      key={`${item.key}-${item.value}`}
                      className={`inline-flex flex-wrap items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                        item.isDefault
                          ? "border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-900/40 text-gray-700 dark:text-gray-200"
                          : "border-blue-200/70 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100"
                      }`}
                    >
                      <span
                        className={`uppercase tracking-wide text-[10px] font-semibold ${
                          item.isDefault
                            ? "text-gray-500 dark:text-gray-400"
                            : "text-blue-500 dark:text-blue-300"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="xl:col-span-3">
              <Search
                placeholder="Search by voucher, office, client or notes..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                icon={HiSearch}
              />
            </div>

            <Select
              label="Payment Type"
              value={filters.type}
              onChange={(value) => handleFilterChange("type", value)}
              options={[
                { value: "", label: "All Types" },
                { value: "INCOMING", label: "Incoming" },
                { value: "OUTGOING", label: "Outgoing" },
              ]}
            />

            <Select
              label="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              options={[
                { value: "", label: "All Statuses" },
                { value: "approved", label: "Approved" },
                { value: "pending", label: "Pending" },
              ]}
            />

            <Select
              label="Currency"
              value={filters.currency}
              onChange={(value) => handleFilterChange("currency", value)}
              options={[
                { value: "", label: "All Currencies" },
                ...currencies.map((currency) => ({
                  value: currency,
                  label: `${currency} (${getCurrencySymbol(currency)})`,
                })),
              ]}
            />

            <Select
              label="Created Year"
              value={filters.createdYear}
              onChange={(value) => handleFilterChange("createdYear", value)}
              options={[{ value: "", label: "All Years" }, ...yearOptions]}
            />

            <Select
              label="Created Month"
              value={filters.createdMonth}
              onChange={(value) => handleFilterChange("createdMonth", value)}
              options={monthOptions}
            />

            <SearchableSelect
              label="Supplier / Office"
              value={filters.office}
              placeholder="All offices"
              onChange={(e) => handleFilterChange("office", e.target.value)}
              options={[
                { value: "", label: "All Offices" },
                ...offices.map((office) => ({ value: office, label: office })),
              ]}
            />

            <SearchableSelect
              label="Client"
              value={filters.client}
              placeholder="All clients"
              onChange={(e) => handleFilterChange("client", e.target.value)}
              options={[
                { value: "", label: "All Clients" },
                ...clients.map((client) => ({ value: client, label: client })),
              ]}
            />

            <SearchableSelect
              label="Created By"
              value={filters.createdBy}
              placeholder="All users"
              onChange={(e) => handleFilterChange("createdBy", e.target.value)}
              options={[
                { value: "", label: "All Users" },
                ...createdByUsers.map((user) => ({
                  value: user.id,
                  label: user.name,
                })),
              ]}
            />

            <SearchableSelect
              label="Approved By"
              value={filters.approvedBy}
              placeholder="All approvers"
              onChange={(e) => handleFilterChange("approvedBy", e.target.value)}
              options={[
                { value: "", label: "All Approvers" },
                ...approvedByUsers.map((user) => ({
                  value: user.id,
                  label: user.name,
                })),
              ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomDatePicker
                label="Date From"
                value={filters.dateFrom}
                onChange={(value) => handleFilterChange("dateFrom", value)}
                placeholder="Select start date"
              />
              <CustomDatePicker
                label="Date To"
                value={filters.dateTo}
                onChange={(value) => handleFilterChange("dateTo", value)}
                placeholder="Select end date"
              />
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <RahalatekLoader size="lg" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <Card className="text-center dark:bg-slate-950">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            No payments found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Try adjusting your filters or refresh the list.
          </p>
        </Card>
      ) : (
        <>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Showing {filteredPayments.length} payment
            {filteredPayments.length !== 1 ? "s" : ""}
          </div>

          <CustomScrollbar className="pr-1">
            <div className="grid grid-cols-1 gap-4">
              {filteredPayments.map((payment) => (
                <Card
                  key={payment._id}
                  className="overflow-hidden border border-gray-200 dark;border-gray-700 bg-white dark:bg-slate-950 px-4 py-3 md:px-5 md:py-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {getCurrencySymbol(payment.currency)}
                        {Number(payment.amount || 0).toFixed(2)}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {payment.type === "INCOMING"
                          ? "Funds Received"
                          : "Funds Disbursed"}{" "}
                        • {payment.currency}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Created {formatDateTime(payment.createdAt)}
                      </p>
                      <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                        Payment ID: {payment._id}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                          payment.type === "INCOMING"
                            ? "text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/30 dark:border-green-700"
                            : "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/30 dark:border-red-700"
                        }`}
                      >
                        {payment.type}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border ${
                          payment.status === "approved"
                            ? "text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/30 dark:border-green-700"
                            : "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700"
                        }`}
                      >
                        {payment.status?.toUpperCase?.() || payment.status}
                      </span>
                      {payment.autoGenerated && (
                        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-700">
                          AUTO-GENERATED
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2.5">
                    <PaymentInfoRow
                      label="Supplier / Office"
                      value={
                        payment.officeName ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/office/${encodeURIComponent(
                                  payment.officeName
                                )}`
                              )
                            }
                            className={linkClasses}
                          >
                            {payment.officeName}
                          </button>
                        ) : (
                          "N/A"
                        )
                      }
                    />
                    <PaymentInfoRow
                      label="Linked Voucher"
                      value={
                        payment.relatedVoucher ? (
                          payment.relatedVoucher._id ? (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/vouchers/${payment.relatedVoucher._id}`
                                )
                              }
                              className={linkClasses}
                            >
                              #{payment.relatedVoucher.voucherNumber} •{" "}
                              {payment.relatedVoucher.clientName || "N/A"}
                            </button>
                          ) : (
                            `#${payment.relatedVoucher.voucherNumber} • ${
                              payment.relatedVoucher.clientName || "N/A"
                            }`
                          )
                        ) : (
                          "N/A"
                        )
                      }
                    />
                    <PaymentInfoRow
                      label="Client"
                      value={payment.relatedVoucher?.clientName}
                    />
                    <PaymentInfoRow
                      label="Created By"
                      value={
                        payment.createdBy?._id ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/profile/${payment.createdBy._id}`)
                            }
                            className={linkClasses}
                          >
                            {payment.createdBy?.name ||
                              payment.createdBy?.username ||
                              "N/A"}
                          </button>
                        ) : (
                          payment.createdBy?.name ||
                          payment.createdBy?.username ||
                          "N/A"
                        )
                      }
                    />
                    <PaymentInfoRow
                      label="Approved By"
                      value={
                        payment.approvedBy?._id ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/profile/${payment.approvedBy._id}`)
                            }
                            className={linkClasses}
                          >
                            {payment.approvedBy?.name ||
                              payment.approvedBy?.username ||
                              (payment.status === "approved"
                                ? "System"
                                : "Pending")}
                          </button>
                        ) : (
                          payment.approvedBy?.name ||
                          payment.approvedBy?.username ||
                          (payment.status === "approved" ? "System" : "Pending")
                        )
                      }
                    />
                    <PaymentInfoRow
                      label="Payment Date"
                      value={
                        <PaymentDateControls
                          currentPaymentDate={payment.paymentDate}
                          onPaymentDateUpdate={(newDate) =>
                            handlePaymentDateUpdate(payment._id, newDate)
                          }
                          canEdit={canEditPaymentDate}
                          className="text-sm"
                        />
                      }
                    />
                  </div>

                  {payment.notes && payment.notes.trim() !== "" && (
                    <div className="mt-2.5 p-2.5 bg-gray-50 dark:bg-slate-900/60 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {payment.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap justify-between items-center gap-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Updated{" "}
                      {formatDateTime(payment.updatedAt || payment.createdAt)}
                    </div>
                    <CustomButton
                      variant="blue"
                      size="sm"
                      icon={HiDownload}
                      onClick={() => handleDownloadReceipt(payment)}
                      loading={downloadingReceiptId === payment._id}
                    >
                      {downloadingReceiptId === payment._id
                        ? "Downloading"
                        : "Receipt"}
                    </CustomButton>
                  </div>
                </Card>
              ))}
            </div>
          </CustomScrollbar>
        </>
      )}

      {showMobileFilterModal && (
        <div className="sm:hidden fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-950 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Active Filters
                </p>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activeFilterLabels.length}{" "}
                  {activeFilterLabels.length === 1 ? "Filter" : "Filters"}
                </h3>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 dark:text-teal-300"
                onClick={() => setShowMobileFilterModal(false)}
              >
                Close
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilterLabels.map((item) => (
                <div
                  key={`${item.key}-mobile`}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                    item.isDefault
                      ? "border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-900/40 text-gray-700 dark:text-gray-200"
                      : "border-blue-200/70 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100"
                  }`}
                >
                  <span
                    className={`uppercase tracking-wide text-[10px] font-semibold ${
                      item.isDefault
                        ? "text-gray-500 dark:text-gray-400"
                        : "text-blue-500 dark:text-blue-300"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
