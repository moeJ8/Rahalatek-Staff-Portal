import React from 'react';
import { Label, TextInput, Checkbox } from 'flowbite-react';

const ChildrenSection = ({
  includeChildren,
  onIncludeChildrenChange,
  childrenUnder3,
  onChildrenUnder3Change,
  children3to6,
  onChildren3to6Change,
  children6to12,
  onChildren6to12Change
}) => {
  return (
    <div className="mt-4">
      <div className="flex items-center space-x-2 mb-2">
        <Checkbox
          id="includeChildren"
          checked={includeChildren}
          onChange={(e) => onIncludeChildrenChange(e.target.checked)}
        />
        <Label htmlFor="includeChildren" className="dark:text-white">
          Include children
        </Label>
      </div>

      {includeChildren && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="childrenUnder3" value="Children (0-3 years)" className="dark:text-white" />
            </div>
            <TextInput
              id="childrenUnder3"
              type="number"
              value={childrenUnder3}
              onChange={(e) => onChildrenUnder3Change(parseInt(e.target.value) || 0)}
              min={0}
            />
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Free on tours</p>
          </div>
          
          <div>
            <div className="mb-2 block">
              <Label htmlFor="children3to6" value="Children (3-6 years)" className="dark:text-white" />
            </div>
            <TextInput
              id="children3to6"
              type="number"
              value={children3to6}
              onChange={(e) => onChildren3to6Change(parseInt(e.target.value) || 0)}
              min={0}
            />
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Free accommodation</p>
          </div>
          
          <div>
            <div className="mb-2 block">
              <Label htmlFor="children6to12" value="Children (6-12 years)" className="dark:text-white" />
            </div>
            <TextInput
              id="children6to12"
              type="number"
              value={children6to12}
              onChange={(e) => onChildren6to12Change(parseInt(e.target.value) || 0)}
              min={0}
            />
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Special hotel rate</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildrenSection; 