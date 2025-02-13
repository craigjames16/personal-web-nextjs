import React from 'react';

interface FormattedTextProps {
  text: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  const formattedText = text?.split('\n').map((line, index) => {
    // Replace asterisks with strong tags for bold text
    const parts = line.split(/(\*(.*?)\*)/g).map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return <strong key={i}>{part.slice(1, -1)}</strong>;
      }
      return part;
    });

    return <div key={index}>{parts}</div>; // Use div for line breaks
  });

  return <>{formattedText}</>;
};

export default FormattedText; 