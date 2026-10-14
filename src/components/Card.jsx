import './Card.css';

function Card({ children, className = '', onClick, animDelay = 0 }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className={`card ${className}`}
      onClick={onClick}
      style={animDelay ? { animationDelay: `${animDelay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

export default Card;