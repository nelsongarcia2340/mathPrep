import katex from 'katex';

interface MathTextProps {
  value: string;
  className?: string;
}

export function MathText({ value, className = '' }: MathTextProps) {
  const segments = value.split(/(\$[^$]+\$)/g);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.startsWith('$') && segment.endsWith('$')) {
          const expression = segment.slice(1, -1);
          return (
            <span
              key={`${segment}-${index}`}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(expression, {
                  throwOnError: false,
                  displayMode: false,
                }),
              }}
            />
          );
        }

        return <span key={`${segment}-${index}`}>{segment}</span>;
      })}
    </span>
  );
}
