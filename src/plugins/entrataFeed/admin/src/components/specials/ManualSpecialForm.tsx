import { type ChangeEvent } from 'react';
import { Box, Field, Flex, IconButton, TextInput, Textarea } from '@strapi/design-system';
import { Trash } from '@strapi/icons';
import { useIntl } from 'react-intl';

import { getTranslation } from '../../utils/getTranslation';
import type { ManualTopSpecial } from '../../utils/specials/types';
import { SpecialLinksEditor } from './SpecialLinksEditor';

type ManualSpecialFormProps = {
  special: ManualTopSpecial;
  onChange: (patch: Partial<ManualTopSpecial>) => void;
  onRemove: () => void;
  disabled?: boolean;
};

const ManualSpecialForm = ({ special, onChange, onRemove, disabled }: ManualSpecialFormProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box width="100%" paddingTop={4} paddingBottom={4}>
      <Flex justifyContent="flex-end" paddingBottom={2}>
        <IconButton
          label={formatMessage({ id: getTranslation('specials.top.manual.remove') })}
          onClick={onRemove}
          variant="ghost"
          disabled={disabled}
        >
          <Trash />
        </IconButton>
      </Flex>
      <Flex direction="column" gap={4} width="100%">
        <Field.Root width="100%">
          <Field.Label>{formatMessage({ id: getTranslation('specials.label.title') })}</Field.Label>
          <TextInput
            value={special.title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ title: e.target.value })}
            style={{ width: '100%' }}
          />
        </Field.Root>
        <Field.Root width="100%">
          <Field.Label>
            {formatMessage({ id: getTranslation('specials.label.description') })}
          </Field.Label>
          <Textarea
            value={special.description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onChange({ description: e.target.value })
            }
            width="100%"
          />
        </Field.Root>
        <SpecialLinksEditor
          name={`manual-${special.clientId}`}
          links={special.links}
          onChange={(links) => onChange({ links })}
          disabled={disabled}
        />
      </Flex>
    </Box>
  );
};

export { ManualSpecialForm };
