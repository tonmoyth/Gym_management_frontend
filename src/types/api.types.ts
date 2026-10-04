// Core Enums
export type Role =
  | 'SUPER_ADMIN'
  | 'BUSINESS_OWNER'
  | 'TRAINER'
  | 'MEMBER'
  | 'ADMIN'
  | 'STAFF';

export type BusinessStatus =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REJECTED';

export type PlanStatus = 'ACTIVE' | 'ARCHIVED';

export type BookingStatus =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type PaymentGateway = 'BKASH' | 'ROCKET' | 'NAGAD' | 'STRIPE';

export type PaymentPurpose = 'MEMBERSHIP' | 'PLATFORM_SUBSCRIPTION';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type CertificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type PayoutStatus = 'PENDING' | 'PAID';

export type DisputeStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';

export type DisputeCategory =
  | 'BILLING'
  | 'SERVICE'
  | 'CONDUCT'
  | 'PAYOUT'
  | 'PAYMENT'
  | 'SERVICE_QUALITY'
  | 'MEMBERSHIP'
  | 'OTHER';

export type NotificationType =
  | 'BOOKING'
  | 'CHAT'
  | 'JOB_MATCH'
  | 'ANNOUNCEMENT'
  | 'PAYOUT'
  | 'DISPUTE'
  | 'SYSTEM'
  | 'JOB_APPLICATION'
  | 'DIET_PLAN';

export type ChatThreadType = 'TRAINER_MEMBER' | 'SUPPORT_MEMBER';

export type ProgressSource = 'SELF' | 'TRAINER';

export type ReferralStatus = 'PENDING' | 'CREDITED';

export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'OVERDUE';

export type PaymentAccountType = 'BANK' | 'BKASH' | 'NAGAD';

export type PaymentAccountStatus = 'ACTIVE' | 'INACTIVE';

export type BillingCycle = 'MONTHLY' | 'YEARLY';

export type SubscriptionPlanStatus = 'ACTIVE' | 'INACTIVE';

export type BusinessSubscriptionStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELLED';

export type SubscriptionPaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type AnnouncementAudience = 'MEMBERS' | 'TRAINERS' | 'BOTH';

export type AttendanceType = 'MEMBER' | 'TRAINER';

export type StaffPermissionRole =
  | 'FRONT_DESK'
  | 'FINANCE'
  | 'TRAINER_MANAGER'
  | 'MEMBER_MANAGER'
  | 'FULL'
  | 'RECEPTIONIST'
  | 'MANAGER'
  | 'TRAINER_COORDINATOR';

export type EquipmentCondition =
  | 'GOOD'
  | 'NEEDS_REPAIR'
  | 'OUT_OF_SERVICE';

export type ClassBookingStatus = 'CONFIRMED' | 'CANCELLED';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'ERROR';

export type VerifyMethod = 'FINGERPRINT' | 'FACE' | 'RFID' | 'PASSWORD' | 'MANUAL';

export type BiometricAttendanceType = 'CHECK_IN' | 'CHECK_OUT';

// Common Pagination & Response Envelopes
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode?: number;
  message?: string | null;
  data: T;
  meta?: PaginationMeta | null;
  token?: string;
  refreshToken?: string;
}

export interface ApiError {
  code?: string;
  message: string;
  statusCode?: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: any;
}

// Entities
export interface User {
  id: string;
  fullName: string | null;
  email: string;
  emailVerified?: boolean;
  profileImage?: string | null;
  role: Role;
  permissions?: string[];
  isActive: boolean;
  isVerified?: boolean;
  status?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  amenities: string[];
  photos: string[];
  status: BusinessStatus;
  referralCode?: string | null;
  createdAt: string;
  updatedAt?: string;
  owner?: Partial<User>;
  plans?: MembershipPlan[];
  trainers?: any[];
  distance?: number;
}

export interface BusinessStaff {
  id: string;
  businessId: string;
  userId: string;
  permissionRole: StaffPermissionRole;
  createdAt: string;
  user?: User;
}

export interface SpecializationTag {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface MembershipPlan {
  id: string;
  businessId: string;
  name: string;
  description?: string | null;
  price: number | string;
  durationDays: number;
  benefits: string[];
  status: PlanStatus;
  createdAt: string;
  updatedAt?: string;
  business?: {
    id: string;
    name: string;
  };
}

export interface Membership {
  id: string;
  memberId: string;
  businessId: string;
  planId: string;
  status: BookingStatus;
  scheduledPlanId?: string | null;
  scheduledPlanDate?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  requestedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt?: string;
  business?: {
    id: string;
    name: string;
    logo?: string | null;
    address?: string;
  };
  plan?: {
    id: string;
    name: string;
    price: number | string;
    durationDays: number;
    benefits?: string[];
  };
  member?: {
    id: string;
    user?: {
      id: string;
      fullName: string;
      email: string;
      profileImage?: string | null;
    };
  };
  payment?: {
    id: string;
    gateway: string;
    transactionId?: string | null;
    senderPhone?: string | null;
    rawTransactionString?: string | null;
    amount?: string | number | null;
    status: string;
  } | null;
}

export interface Payment {
  id: string;
  payerUserId: string;
  membershipId?: string | null;
  subscriptionId?: string | null;
  amount: number | string;
  currency: string;
  gateway: PaymentGateway;
  gatewayTransactionId?: string | null;
  transactionId?: string | null;
  status: PaymentStatus;
  purpose: PaymentPurpose;
  createdAt: string;
  updatedAt?: string;
  invoice?: Invoice | null;
  payer?: Partial<User>;
}

export interface Invoice {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  pdfUrl: string;
  issuedAt: string;
}

export interface PlatformSubscription {
  id: string;
  businessId: string;
  status: SubscriptionStatus;
  plan?: string;
  currentPeriodEnd?: string;
  nextBillingDate: string;
  createdAt: string;
  updatedAt?: string;
  business?: Partial<Business>;
}

export interface AttendanceLog {
  id: string;
  businessId?: string;
  memberId?: string;
  deviceId?: string | null;
  attendanceType: BiometricAttendanceType;
  verifyMethod: VerifyMethod;
  attendanceTime: string;
  rawPayload?: string | null;
  createdAt?: string;
  member?: {
    id: string;
    user?: {
      fullName?: string | null;
      email?: string | null;
      profileImage?: string | null;
    };
  };
  device?: {
    id?: string;
    name?: string;
    serialNumber?: string;
  } | null;
  business?: {
    name: string;
  };
}

export interface TodayAttendanceSummary {
  totalCheckIn: number;
  totalCheckOut: number;
  currentlyInside: number;
  attendanceRate: number;
  totalCheckIns?: number;
  totalCheckOuts?: number;
  currentlyPresent?: number;
}

export interface AttendanceReportParams {
  dateFrom?: string;
  dateTo?: string;
  memberId?: string;
  attendanceType?: BiometricAttendanceType;
  verifyMethod?: VerifyMethod;
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TestDeviceAttendanceInput {
  serialNumber: string;
  biometricId: string;
  attendanceTime: string;
  verifyMethod?: VerifyMethod;
  type?: BiometricAttendanceType;
}

export interface AttendanceSummary {
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
}

export interface BiometricDevice {
  id: string;
  businessId: string;
  serialNumber: string;
  name: string;
  brand: string;
  status: DeviceStatus;
  lastHeartbeat: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerProfile {
  id: string;
  userId: string;
  bio?: string | null;
  gender?: Gender | null;
  experience: number;
  profileCompletionPercent: number;
  verifiedBadge: boolean;
  avgRating: number | string;
  createdAt: string;
  updatedAt?: string;
  user?: User;
  specializations?: {
    id?: string;
    tag: SpecializationTag;
  }[];
  certifications?: TrainerCertification[];
  businesses?: {
    businessId: string;
    joinedAt: string;
    business?: Partial<Business>;
  }[];
  paymentAccounts?: PaymentAccount[];
  monthlySalary?: number | string | null;
}

export interface TrainerCertification {
  id: string;
  trainerId: string;
  title: string;
  fileUrl: string;
  status: CertificationStatus;
  issuer: string;
  issueDate: string;
  expiryDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface JobPost {
  id: string;
  businessId: string;
  title: string;
  description: string;
  specializationTagId: string;
  isOpen: boolean;
  salary?: number | string | null;
  experience?: number | null;
  createdAt: string;
  specializationTag?: SpecializationTag;
  specialization?: SpecializationTag;
  business?: {
    id: string;
    name: string;
    logo?: string | null;
    address?: string;
  };
  _count?: {
    applications: number;
  };
}

export interface TrainerApplication {
  id: string;
  jobPostId: string;
  trainerId: string;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string | null;
  jobPost?: JobPost;
  trainer?: TrainerProfile;
}

export interface MemberProfile {
  id: string;
  userId: string;
  fitnessGoalTagId?: string | null;
  referralCode?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: User;
  fitnessGoalTag?: SpecializationTag | null;
}

export interface ProgressLog {
  id: string;
  memberId: string;
  source: ProgressSource;
  loggedByUserId: string;
  weight?: number | string | null;
  bmi?: number | string | null;
  measurements?: any;
  workoutLog?: string | null;
  loggedAt: string;
  loggedByUser?: Partial<User>;
}

export interface DietPlan {
  id: string;
  trainerId: string;
  memberId: string;
  businessId: string;
  content: {
    meals?: {
      time: string;
      name: string;
      calories?: number;
      items: string[];
      notes?: string;
    }[];
    notes?: string;
    guidelines?: string[];
  };
  createdAt: string;
  updatedAt: string;
  trainer?: {
    id: string;
    user?: {
      fullName: string;
    };
  };
  member?: {
    id: string;
    user?: {
      fullName: string;
    };
  };
}

export interface ClassSchedule {
  id: string;
  businessId: string;
  trainerId?: string | null;
  title: string;
  description?: string | null;
  daysOfWeek?: string[];
  timeSlot?: string;
  startTimeStr?: string | null;
  endTimeStr?: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount?: number;
  availableSlots?: number;
  createdAt: string;
  updatedAt?: string;
  trainers?: Array<{
    id: string;
    name: string;
    profileImage?: string | null;
  }>;
  trainer?: {
    id: string;
    name?: string;
    user?: {
      fullName: string;
    };
  } | null;
  business?: {
    id: string;
    name: string;
  };
  _count?: {
    bookings: number;
  };
}

export interface ClassBooking {
  id: string;
  classScheduleId: string;
  memberId: string;
  status: ClassBookingStatus;
  bookedAt: string;
  classSchedule?: ClassSchedule;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  sentAt: string;
  readAt?: string | null;
  sender?: Partial<User>;
}

export interface ChatThread {
  id: string;
  type: ChatThreadType;
  businessId: string;
  memberId: string;
  trainerId?: string | null;
  createdAt: string;
  messages?: ChatMessage[];
  business?: Partial<Business>;
  member?: MemberProfile;
  trainer?: TrainerProfile;
}

export interface Review {
  id: string;
  memberId: string;
  businessId: string;
  trainerId?: string | null;
  rating: number;
  comment?: string | null;
  isRemoved: boolean;
  createdAt: string;
  member?: {
    user?: {
      fullName: string;
      profileImage?: string | null;
    };
  };
  business?: {
    name: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}

export interface Dispute {
  id: string;
  subject?: string;
  description: string;
  status: DisputeStatus;
  category: DisputeCategory;
  userId: string;
  trainerId?: string | null;
  businessId?: string | null;
  adminReply?: string | null;
  resolutionNote?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  user?: Partial<User>;
  business?: Partial<Business>;
  trainer?: Partial<TrainerProfile>;
}

export interface Equipment {
  id: string;
  businessId: string;
  name: string;
  quantity: number;
  condition: EquipmentCondition;
  lastMaintenanceDate?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Announcement {
  id: string;
  businessId: string;
  title: string;
  body: string;
  content?: string;
  audience: AnnouncementAudience;
  targetAudience?: AnnouncementAudience;
  createdAt: string;
}

export interface TrainerPayout {
  id: string;
  businessId?: string;
  trainerId?: string;
  month: string | number;
  year?: number;
  amount: number | string;
  status: PayoutStatus;
  paidAt?: string | null;
  note?: string | null;
  transactionReference?: string | null;
  createdAt?: string;
  trainer?: {
    id?: string;
    name?: string;
    email?: string;
    profilePhoto?: string;
    user?: {
      fullName: string;
      email: string;
    };
    paymentAccounts?: PaymentAccount[];
  };
  business?: {
    name: string;
  };
}

export interface Favorite {
  id: string;
  memberId: string;
  businessId: string;
  createdAt: string;
  business?: Business;
}

export interface MemberReferral {
  id: string;
  referrerMemberId: string;
  referredUserId: string;
  businessId: string;
  referralCode: string;
  commissionAmount: number | string;
  status: ReferralStatus;
  creditedAt?: string | null;
  createdAt: string;
  referredUser?: Partial<User>;
  business?: Partial<Business>;
}

export interface MemberReferralSetting {
  id: string;
  businessId: string;
  commissionAmount: number | string;
  referralDiscount?: number | string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessReferral {
  id: string;
  referrerOwnerId: string;
  referredBusinessId: string;
  referralCode: string;
  commissionAmount: number | string;
  status: ReferralStatus;
  creditedAt?: string | null;
  createdAt: string;
  referredBusiness?: Partial<Business>;
  referrerOwner?: Partial<User>;
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  businessId?: string | null;
  details?: string | null;
  metadata?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  actor?: Partial<User>;
  user?: Partial<User>;
  business?: Partial<Business>;
}

export type PaginatedResponse<T> = ApiResponse<T[]>;

export interface PaymentAccount {
  id: string;
  userId?: string | null;
  businessId?: string | null;
  trainerId?: string | null;
  accountType: PaymentAccountType;
  accountName: string;
  accountNumber: string;
  bankName?: string | null;
  branchName?: string | null;
  routingNumber?: string | null;
  isDefault: boolean;
  status: PaymentAccountStatus;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>;
  business?: Partial<Business>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  billingCycle: BillingCycle;
  durationDays: number;
  features: string[];
  status: SubscriptionPlanStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    businessSubscriptions?: number;
    subscriptionPayments?: number;
  };
}

export interface BusinessSubscription {
  id: string;
  businessId: string;
  subscriptionPlanId: string;
  status: BusinessSubscriptionStatus;
  startDate?: string | null;
  endDate?: string | null;
  planName: string;
  planPrice: number | string;
  billingCycle: BillingCycle;
  features: string[];
  createdAt: string;
  updatedAt: string;
  business?: Partial<Business>;
  subscriptionPlan?: SubscriptionPlan;
}

export interface SubscriptionPayment {
  id: string;
  businessId: string;
  businessSubscriptionId?: string | null;
  subscriptionPlanId: string;
  amount: number | string;
  currency: string;
  paymentMethod: PaymentAccountType;
  transactionId: string;
  paymentProof?: string | null;
  paymentAccountId?: string | null;
  status: SubscriptionPaymentStatus;
  rejectionReason?: string | null;
  reviewedByAdminId?: string | null;
  reviewedAt?: string | null;
  planName: string;
  billingCycle: BillingCycle;
  features: string[];
  createdAt: string;
  updatedAt: string;
  business?: Partial<Business>;
  subscriptionPlan?: SubscriptionPlan;
  paymentAccount?: PaymentAccount | null;
  reviewedByAdmin?: Partial<User> | null;
}

export interface SubscriptionStatusOverview {
  businessId: string;
  businessName: string;
  businessStatus: BusinessStatus;
  hasActiveBusiness: boolean;
  subscription: {
    id: string;
    status: BusinessSubscriptionStatus;
    planName: string;
    planPrice: number;
    billingCycle: BillingCycle;
    features: string[];
    startDate?: string | null;
    endDate?: string | null;
    isExpired: boolean;
    daysRemaining: number;
    canRenew: boolean;
  } | null;
  recentPayments: Array<{
    id: string;
    amount: number;
    currency: string;
    paymentMethod: PaymentAccountType;
    transactionId: string;
    status: SubscriptionPaymentStatus;
    rejectionReason?: string | null;
    paymentAccount?: PaymentAccount | null;
    createdAt: string;
  }>;
}
