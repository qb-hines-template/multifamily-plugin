import { Box, Flex, Typography } from '@strapi/design-system';
import type { ReactNode } from 'react';

type FormCardProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

const FormCard = ({ title, action, children }: FormCardProps) => (
  <Box
    width="100%"
    background="neutral0"
    borderColor="neutral200"
    borderStyle="solid"
    borderWidth="1px"
    hasRadius
    shadow="tableShadow"
    padding={6}
  >
    <Flex justifyContent="space-between" alignItems="center" paddingBottom={5} gap={3}>
      <Typography variant="delta" tag="h2">
        {title}
      </Typography>
      {action}
    </Flex>
    {children}
  </Box>
);

export { FormCard };
