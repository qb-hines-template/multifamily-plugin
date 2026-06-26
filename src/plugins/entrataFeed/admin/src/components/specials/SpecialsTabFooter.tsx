import { Box, Button, Divider, Flex } from '@strapi/design-system';
import { useIntl } from 'react-intl';

import { getTranslation } from '../../utils/getTranslation';

type SpecialsTabFooterProps = {
  isBusy: boolean;
  onRefresh: () => void;
  onSave?: () => void;
  onPublish: () => void;
};

const SpecialsTabFooter = ({ isBusy, onRefresh, onSave, onPublish }: SpecialsTabFooterProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box shrink={0} width="100%" background="neutral0" paddingTop={4} paddingBottom={4}>
      <Divider />
      <Flex justifyContent="center" gap={2} paddingTop={4}>
        <Button variant="secondary" onClick={onRefresh} disabled={isBusy}>
          {formatMessage({ id: getTranslation('specials.refresh') })}
        </Button>
        {onSave ? (
          <Button variant="secondary" onClick={onSave} loading={isBusy}>
            {formatMessage({ id: getTranslation('specials.save') })}
          </Button>
        ) : null}
        <Button onClick={onPublish} loading={isBusy}>
          {formatMessage({ id: getTranslation('specials.publish') })}
        </Button>
      </Flex>
    </Box>
  );
};

export { SpecialsTabFooter };
