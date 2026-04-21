export default function RatingStars({ value }) {
  const rounded = Math.round(value || 0);
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= rounded ? '#F59E0B' : '#D1D5DB' }}>
          ★
        </span>
      ))}
    </div>
  );
}
