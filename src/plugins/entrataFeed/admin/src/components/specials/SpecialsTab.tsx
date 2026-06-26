import { Box, Button, Divider, Flex, Typography } from '@strapi/design-system';
import { Plus } from '@strapi/icons';
import { useIntl } from 'react-intl';

import { useSpecialsTab } from '../../hooks/useSpecialsTab';
import { getTranslation } from '../../utils/getTranslation';
import { FeedSpecialForm } from './FeedSpecialForm';
import { FormCard } from './FormCard';
import { ManualSpecialForm } from './ManualSpecialForm';
import { SpecialsTabFooter } from './SpecialsTabFooter';

const SpecialsTab = () => {
  const { formatMessage } = useIntl();
  const {
    form,
    setForm,
    isLoading,
    isBusy,
    loadSpecials,
    handleSave,
    handlePublish,
    handleRemoveManual,
    addManualSpecial,
  } = useSpecialsTab();

  if (isLoading) {
    return (
      <Typography textColor="neutral600">
        {formatMessage({ id: getTranslation('specials.loading') })}
      </Typography>
    );
  }

  return (
    <Flex direction="column" width="100%" height="calc(100vh - 14rem)">
      <Box flex="1" overflow="auto" paddingBottom={4} width="100%" style={{ minHeight: 0 }}>
        <Flex direction="column" gap={4} width="100%">
          <FormCard title={formatMessage({ id: getTranslation('specials.top.title') })}>
            <FeedSpecialForm
              name="top"
              special={form.feedTopSpecial}
              onChange={(patch) =>
                setForm((current) => ({
                  ...current,
                  feedTopSpecial: { ...current.feedTopSpecial, ...patch },
                }))
              }
            />
          </FormCard>

          <FormCard
            title={formatMessage({ id: getTranslation('specials.top.manual.heading') })}
            action={
              <Button variant="secondary" size="S" startIcon={<Plus />} onClick={addManualSpecial}>
                {formatMessage({ id: getTranslation('specials.top.manual.add') })}
              </Button>
            }
          >
            {form.additionalTopSpecials.length === 0 ? (
              <Typography variant="pi" textColor="neutral500">
                {formatMessage({ id: getTranslation('specials.top.manual.empty') })}
              </Typography>
            ) : (
              <Box width="100%">
                {form.additionalTopSpecials.map((special, index) => (
                  <Box key={special.clientId} width="100%">
                    {index > 0 ? <Divider /> : null}
                    <ManualSpecialForm
                      special={special}
                      disabled={isBusy}
                      onChange={(patch) =>
                        setForm((current) => ({
                          ...current,
                          additionalTopSpecials: current.additionalTopSpecials.map((item) =>
                            item.clientId === special.clientId ? { ...item, ...patch } : item
                          ),
                        }))
                      }
                      onRemove={() => handleRemoveManual(special.clientId)}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </FormCard>

          <FormCard title={formatMessage({ id: getTranslation('specials.popup.title') })}>
            <FeedSpecialForm
              name="popup"
              special={form.popupSpecial}
              onChange={(patch) =>
                setForm((current) => ({
                  ...current,
                  popupSpecial: { ...current.popupSpecial, ...patch },
                }))
              }
            />
          </FormCard>
        </Flex>
      </Box>

      <SpecialsTabFooter
        isBusy={isBusy}
        onRefresh={loadSpecials}
        onSave={handleSave}
        onPublish={handlePublish}
      />
    </Flex>
  );
};

export { SpecialsTab };
