export const timeAgo = (createdAt: Date) =>  {
  const now = Date.now(); 
  const created = new Date(createdAt).getTime();
  const diffMs = now - created 
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "vừa xong";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  return `${Math.floor(diffSec / 86400)} ngày trước`;
}

export const getRemainingTime = (expiresAt: Date) => {
  const now = Date.now(); 
  const expireTime = new Date(expiresAt).getTime();
  const remainingMs = expireTime - now;

  if (remainingMs <= 0) return null; 

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
}