import React, { useEffect, useRef } from "react";

interface LocationInputProps {
  value: string;
  onChange: (val: string) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current!,
      { types: ["geocode"] }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place?.formatted_address) {
        onChange(place.formatted_address);
      }
    });
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      className="form-input"
      placeholder="Enter location"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default LocationInput;
