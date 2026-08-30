import { Opportunity } from '../types';

/**
 * Checks if an opportunity is a Scholarship, Fellowship, or Grant where academic requirements apply.
 */
export function isScholarshipType(typeStr: string = ''): boolean {
  const lower = typeStr.toLowerCase();
  return lower.includes('scholarship') || lower.includes('fellowship') || lower.includes('grant');
}

/**
 * Filters requirement list based on opportunity type.
 * For non-scholarships (Hackathons, Internships, Jobs), removes academic prerequisites like IELTS, CGPA, TOEFL, GRE.
 */
export function filterRequirements(requirements: string[] = [], typeStr: string = ''): string[] {
  if (isScholarshipType(typeStr)) {
    return requirements;
  }

  // Non-scholarship filtering: remove IELTS, CGPA, TOEFL, GRE, Academic transcript requirements
  const academicTerms = [
    'ielts',
    'toefl',
    'cgpa',
    'gpa requirement',
    'min gpa',
    'minimum gpa',
    'english proficiency',
    'gre score',
    'gmat',
    'academic transcript',
    'language certificate'
  ];

  return requirements.filter((req) => {
    const lowerReq = req.toLowerCase();
    return !academicTerms.some((term) => lowerReq.includes(term));
  });
}

/**
 * Calculates remaining hours to deadline for an opportunity.
 * Returns exact hours remaining, or null if indefinite/passed.
 */
export function getRemainingDeadlineHours(opportunity: Opportunity): number | null {
  if (opportunity.deadlinePassed) return null;

  if (typeof opportunity.remainingHours === 'number' && opportunity.remainingHours >= 0) {
    return opportunity.remainingHours;
  }

  if (opportunity.urgent24h) {
    return 18.5; // Default fallback for urgent flag
  }

  const deadlineStr = (opportunity.deadline || '').toLowerCase();
  if (deadlineStr.includes('closing today') || deadlineStr.includes('24h') || deadlineStr.includes('last day')) {
    return 12.0;
  }
  if (deadlineStr.includes('closing tomorrow')) {
    return 22.0;
  }

  if (opportunity.deadlineDate && opportunity.deadlineDate.length >= 10) {
    try {
      const now = new Date();
      const dl = new Date(opportunity.deadlineDate);
      // Set end of deadline day
      dl.setHours(23, 59, 59, 999);
      const diffMs = dl.getTime() - now.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      if (hours > 0) {
        return Math.round(hours * 10) / 10;
      }
    } catch {
      // Fallthrough
    }
  }

  return null;
}

/**
 * Checks if an opportunity strictly qualifies for <24h urgent deadline alert.
 */
export function isUrgentUnder24h(opportunity: Opportunity): boolean {
  if (opportunity.deadlinePassed) return false;
  if (opportunity.urgent24h) return true;

  const hours = getRemainingDeadlineHours(opportunity);
  if (hours !== null && hours > 0 && hours <= 24) {
    return true;
  }

  const deadlineStr = (opportunity.deadline || '').toLowerCase();
  return deadlineStr.includes('closing today') || deadlineStr.includes('<24h') || deadlineStr.includes('24 hours');
}
