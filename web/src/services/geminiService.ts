// AI is deliberately disabled for the P0 MVP. Future AI calls must be mediated
// by the authenticated API; no provider credential may be added to Vite env.
export async function generateLeaseSummary(leaseText: string): Promise<string> {
  void leaseText;
  return 'AI lease analysis is disabled for the MVP.';
}

export async function analyzeMaintenanceTriage(
  description: string,
): Promise<{ priority: string; advice: string }> {
  void description;
  return { priority: 'Medium', advice: 'AI triage is disabled. Assess manually.' };
}
