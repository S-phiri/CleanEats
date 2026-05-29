/** Log cache assembly / generation stats to api_logs when the table exists. */
export async function logCacheEvent(supabase, userId, {
  endpoint = '/api/plan/assemble',
  promptType = 'cache_assembly',
  creditsUsed = 0,
  cacheHits = 0,
  cacheMisses = 0,
  model = 'cache',
  durationMs = null,
  inputTokens = null,
  outputTokens = null,
}) {
  try {
    const row = {
      user_id: userId,
      endpoint,
      credits_used: creditsUsed,
      model,
      prompt_type: promptType,
      cache_hits: cacheHits,
      cache_misses: cacheMisses,
      duration_ms: durationMs,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
    }
    const { error } = await supabase.from('api_logs').insert(row)
    if (error && process.env.NODE_ENV !== 'production') {
      console.warn('api_logs insert skipped:', error.message)
    }
  } catch (e) {
    console.warn('logCacheEvent failed:', e?.message)
  }
}
