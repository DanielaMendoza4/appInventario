import './Card.css';

export default function Card({
  as: Tag = 'div',
  interactive = false,
  staggerIndex,
  className = '',
  style,
  children,
  ...rest
}) {
  const classes = [
    'ui-card',
    interactive ? 'ui-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const mergedStyle =
    staggerIndex === undefined
      ? style
      : { '--stagger': staggerIndex, ...style };

  return (
    <Tag className={classes} style={mergedStyle} {...rest}>
      {children}
    </Tag>
  );
}
