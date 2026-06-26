import { type ChangeEvent } from 'react';
import { Checkbox, Field, Flex, TextInput, Textarea, Typography } from '@strapi/design-system';
import { useIntl } from 'react-intl';

import { getTranslation } from '../../utils/getTranslation';
import type { SpecialFormState } from '../../utils/specials/types';
import { SpecialLinksEditor } from './SpecialLinksEditor';

type FeedSpecialFormProps = {
  name: string;
  special: SpecialFormState;
  onChange: (patch: Partial<SpecialFormState>) => void;
};

const FeedSpecialForm = ({ name, special, onChange }: FeedSpecialFormProps) => {
  const { formatMessage } = useIntl();

  return (
    <Flex direction="column" gap={4} width="100%">
      <Typography variant="sigma" textColor="neutral500">
        {formatMessage({ id: getTranslation('specials.original.heading') })}
      </Typography>

      <Field.Root name={`${name}-feed-title`} width="100%">
        <Field.Label>{formatMessage({ id: getTranslation('specials.label.title') })}</Field.Label>
        <TextInput
          name={`${name}-feed-title`}
          value={special.specialTitle}
          disabled
          style={{ width: '100%' }}
        />
      </Field.Root>

      <Field.Root name={`${name}-feed-description`} width="100%">
        <Field.Label>
          {formatMessage({ id: getTranslation('specials.label.description') })}
        </Field.Label>
        <Textarea
          name={`${name}-feed-description`}
          value={special.specialDescription}
          disabled
          width="100%"
        />
      </Field.Root>

      <Flex gap={4} alignItems="center" paddingTop={1} wrap="wrap">
        <Flex gap={2} alignItems="center">
          <Checkbox
            checked={special.showSpecials}
            onCheckedChange={(checked: boolean | 'indeterminate') =>
              onChange({ showSpecials: checked === true })
            }
          />
          <Typography variant="omega">
            {formatMessage({ id: getTranslation('specials.show.label') })}
          </Typography>
        </Flex>
        <Flex gap={2} alignItems="center">
          <Checkbox
            checked={special.isOverRide}
            onCheckedChange={(checked: boolean | 'indeterminate') =>
              onChange({ isOverRide: checked === true })
            }
          />
          <Typography variant="omega">
            {formatMessage({ id: getTranslation('specials.override.label') })}
          </Typography>
        </Flex>
      </Flex>

      {special.isOverRide ? (
        <Flex direction="column" gap={4} width="100%">
          <Field.Root name={`${name}-override-title`} width="100%">
            <Field.Label>
              {formatMessage({ id: getTranslation('specials.label.customTitle') })}
            </Field.Label>
            <TextInput
              name={`${name}-override-title`}
              value={special.overRideText}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChange({ overRideText: e.target.value })
              }
              style={{ width: '100%' }}
            />
          </Field.Root>
          <Field.Root name={`${name}-override-description`} width="100%">
            <Field.Label>
              {formatMessage({
                id: getTranslation('specials.label.customDescription'),
              })}
            </Field.Label>
            <Textarea
              name={`${name}-override-description`}
              value={special.overRideDescription}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                onChange({ overRideDescription: e.target.value })
              }
              width="100%"
            />
          </Field.Root>
        </Flex>
      ) : null}

      <SpecialLinksEditor
        name={name}
        links={special.links}
        onChange={(links) => onChange({ links })}
      />
    </Flex>
  );
};

export { FeedSpecialForm };
