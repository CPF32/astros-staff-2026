import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface AutocompleteInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: string[];
  placeholder?: string;
  maxVisibleOptions?: number;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  maxVisibleOptions = 200,
}) => {
  const [open, setOpen] = useState(false);
  const blurCloseTimer = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [menuRect, setMenuRect] = useState<{ left: number; top: number; width: number } | null>(null);

  const filtered = useMemo(() => {
    const needle = value.trim().toLowerCase();

    if (!needle) return options.slice(0, maxVisibleOptions);

    const starts: string[] = [];
    const contains: string[] = [];

    for (const opt of options) {
      const o = opt.toLowerCase();
      if (o.startsWith(needle)) starts.push(opt);
      
      else if (o.includes(needle)) contains.push(opt);
      
      if (starts.length + contains.length >= maxVisibleOptions) break;
    }

    return starts.concat(contains).slice(0, maxVisibleOptions);

  }, [options, value, maxVisibleOptions]);

  const closeSoon = () => {
    if (blurCloseTimer.current != null) window.clearTimeout(blurCloseTimer.current);
    blurCloseTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  const cancelClose = () => {
    if (blurCloseTimer.current != null) window.clearTimeout(blurCloseTimer.current);
    blurCloseTimer.current = null;
  };

  const updateRect = () => {
    const el = inputRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    setMenuRect({ left: r.left, top: r.bottom + 4, width: r.width });
  };

  useEffect(() => {
    if (!open) return;

    updateRect();
    const onScrollOrResize = () => updateRect();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
    
  }, [open]);

  return (
    <div className="autocomplete">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setOpen(true);
          updateRect();
        }}
        onBlur={closeSoon}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
      />
      {open &&
        filtered.length > 0 &&
        menuRect != null &&
        createPortal(
          <div
            className="autocomplete-menu"
            role="listbox"
            id={`${id}-listbox`}
            onMouseDown={cancelClose}
            style={{ left: menuRect.left, top: menuRect.top, width: menuRect.width }}
          >
            {filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                className="autocomplete-option"
                role="option"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                title={opt}
              >
                {opt}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export default AutocompleteInput;

