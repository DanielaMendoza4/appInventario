import './Chip.css';

export default function Chip({
  active = false,
  children,
  count,
  onClick,
  className = '',
  as: Tag = 'button',
  ...rest
}) {
  const isButton = Tag === 'button';
  const classes = ['ui-chip', active ? 'ui-chip--active' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      type={isButton ? 'button' : undefined}
      className={classes}
      onClick={onClick}
      aria-pressed={isButton ? active : undefined}
      {...rest}
    >
      <span>{children}</span>
      {count !== undefined && count !== null && (
        <span className="ui-chip__count">{count}</span>
      )}
    </Tag>
  );
}
