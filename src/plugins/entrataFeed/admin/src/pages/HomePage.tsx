import { Box } from "@strapi/design-system";
import { Page } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";

import { SpecialsTab } from "../components/specials/SpecialsTab";
import { getTranslation } from "../utils/getTranslation";

const HomePage = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Page.Title>
        {formatMessage({ id: getTranslation("plugin.name") })}
      </Page.Title>
      <Page.Main>
        <Box padding={8} minHeight="calc(100vh - 10rem)" width="100%">
          <SpecialsTab />
        </Box>
      </Page.Main>
    </>
  );
};

export { HomePage };
