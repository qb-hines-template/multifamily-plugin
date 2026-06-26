import { type ChangeEvent } from 'react';
import {
  Box,
  Button,
  Divider,
  Field,
  Flex,
  IconButton,
  SingleSelect,
  SingleSelectOption,
  TextInput,
  Typography,
} from '@strapi/design-system';
import { Plus, Trash } from '@strapi/icons';
import { useIntl } from 'react-intl';

import { getTranslation } from '../../utils/getTranslation';
import { createLink } from '../../utils/specials/transforms';
import type { LinkFormState, LinkTarget } from '../../utils/specials/types';

type SpecialLinksEditorProps = {
  name: string;
  links: LinkFormState[];
  onChange: (links: LinkFormState[]) => void;
  disabled?: boolean;
};

const TARGET_OPTIONS: LinkTarget[] = ['_blank', '_self', '_parent', '_top'];

const SpecialLinksEditor = ({ name, links, onChange, disabled }: SpecialLinksEditorProps) => {
  const { formatMessage } = useIntl();

  const updateLink = (clientId: string, patch: Partial<LinkFormState>) => {
    onChange(links.map((link) => (link.clientId === clientId ? { ...link, ...patch } : link)));
  };

  const removeLink = (clientId: string) => {
    onChange(links.filter((link) => link.clientId !== clientId));
  };

  const addLink = () => {
    onChange([...links, createLink()]);
  };

  return (
    <Box width="100%" paddingTop={2}>
      <Flex justifyContent="space-between" alignItems="center" paddingBottom={3}>
        <Typography variant="sigma" textColor="neutral500">
          {formatMessage({ id: getTranslation('specials.links.heading') })}
        </Typography>
        <Button
          variant="secondary"
          size="S"
          startIcon={<Plus />}
          onClick={addLink}
          disabled={disabled}
        >
          {formatMessage({ id: getTranslation('specials.links.add') })}
        </Button>
      </Flex>

      {links.length === 0 ? (
        <Typography variant="pi" textColor="neutral500">
          {formatMessage({ id: getTranslation('specials.links.empty') })}
        </Typography>
      ) : (
        <Flex direction="column" gap={4} width="100%">
          {links.map((link, index) => (
            <Box key={link.clientId} width="100%">
              {index > 0 ? <Divider /> : null}
              <Box paddingTop={index > 0 ? 4 : 0} width="100%">
                <Flex justifyContent="flex-end" paddingBottom={2}>
                  <IconButton
                    label={formatMessage({
                      id: getTranslation('specials.links.remove'),
                    })}
                    onClick={() => removeLink(link.clientId)}
                    variant="ghost"
                    disabled={disabled}
                  >
                    <Trash />
                  </IconButton>
                </Flex>
                <Flex direction="column" gap={4} width="100%">
                  <Field.Root name={`${name}-link-${link.clientId}-text`} width="100%">
                    <Field.Label>
                      {formatMessage({
                        id: getTranslation('specials.links.label.text'),
                      })}
                    </Field.Label>
                    <TextInput
                      name={`${name}-link-${link.clientId}-text`}
                      value={link.text}
                      maxLength={60}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateLink(link.clientId, { text: e.target.value })
                      }
                      disabled={disabled}
                      style={{ width: '100%' }}
                    />
                  </Field.Root>
                  <Field.Root name={`${name}-link-${link.clientId}-href`} width="100%">
                    <Field.Label>
                      {formatMessage({
                        id: getTranslation('specials.links.label.href'),
                      })}
                    </Field.Label>
                    <TextInput
                      name={`${name}-link-${link.clientId}-href`}
                      value={link.href}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateLink(link.clientId, { href: e.target.value })
                      }
                      disabled={disabled}
                      style={{ width: '100%' }}
                    />
                  </Field.Root>
                  <Field.Root name={`${name}-link-${link.clientId}-target`} width="100%">
                    <Field.Label>
                      {formatMessage({
                        id: getTranslation('specials.links.label.target'),
                      })}
                    </Field.Label>
                    <SingleSelect
                      value={link.target}
                      onChange={(value: string | number) =>
                        updateLink(link.clientId, { target: value as LinkTarget })
                      }
                      disabled={disabled}
                    >
                      {TARGET_OPTIONS.map((target) => (
                        <SingleSelectOption key={target} value={target}>
                          {target}
                        </SingleSelectOption>
                      ))}
                    </SingleSelect>
                  </Field.Root>
                </Flex>
              </Box>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
};

export { SpecialLinksEditor };
