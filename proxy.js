// A server-generated denial for private Hall URLs until real collaborator auth exists.
// This is not a sign-in flow. Public repository content is still public on GitHub.
export default function proxy(request) {
  return new Response('This Scrap Radar Family collaboration area is not publicly available.', {
    status: 403,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'private, no-store, max-age=0',
      'x-content-type-options': 'nosniff',
      'x-robots-tag': 'noindex, nofollow'
    }
  });
}
