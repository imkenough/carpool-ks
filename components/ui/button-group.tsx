import * as React from 'react';
import { View } from 'react-native';
import { Button } from './button';
import { Text } from './text';

interface ButtonGroupProps {
  options: { label: string; value: string }[];
  value: string;
  onValueChange: (value: string) => void;
  layout?: string[][];
}

export function ButtonGroup({ options, value, onValueChange, layout }: ButtonGroupProps) {
  const renderButtons = (buttonValues: string[]) => {
    return buttonValues.map((buttonValue, index) => {
      const option = options.find((opt) => opt.value === buttonValue);
      if (!option) {
        return null;
      }
      return (
        <Button
          key={option.value}
          onPress={() => onValueChange(option.value)}
          variant={value === option.value ? 'default' : 'outline'}
          className={`flex-1 ${index > 0 ? 'rounded-l-none' : ''} ${
            index < buttonValues.length - 1 ? 'rounded-r-none' : ''
          } ${index > 0 ? 'border-l-0' : ''}`}>
          <Text
            variant={value === option.value ? 'default' : 'outline'}
            className="text-sm font-medium">
            {option.label}
          </Text>
        </Button>
      );
    });
  };

  if (layout) {
    return (
      <View className="flex flex-col">
        {layout.map((row, rowIndex) => (
          <View key={rowIndex} className={`flex flex-row ${rowIndex > 0 ? 'mt-2' : ''}`}>
            {renderButtons(row)}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex flex-row">
      {renderButtons(options.map((opt) => opt.value))}
    </View>
  );
}