import { useCallback, useEffect, useRef, useState } from "react";
import { useFetchClient, useNotification } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";

import { getTranslation } from "../utils/getTranslation";
import { PROPERTY_SETTING_PATH } from "../utils/specials/constants";
import {
  createManualTopSpecial,
  emptyPropertySettingForm,
  toPropertySettingForm,
  toPropertySettingPayload,
} from "../utils/specials/transforms";
import type { PropertySettingForm, PropertySettingResponse } from "../utils/specials/types";

export const useSpecialsTab = () => {
  const { formatMessage } = useIntl();
  const { get, put } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [form, setForm] = useState<PropertySettingForm>(emptyPropertySettingForm);
  const formRef = useRef(form);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const loadSpecials = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data } = await get<PropertySettingResponse>(PROPERTY_SETTING_PATH);
      const setting = data.data ?? data;

      setForm(toPropertySettingForm(setting));
    } catch {
      toggleNotification({
        type: "danger",
        message: formatMessage({ id: getTranslation("specials.load.error") }),
      });
    } finally {
      setIsLoading(false);
    }
  }, [formatMessage, get, toggleNotification]);

  useEffect(() => {
    loadSpecials();
  }, [loadSpecials]);

  const persistSetting = useCallback(
    async (nextForm: PropertySettingForm, publish = false) => {
      await put(PROPERTY_SETTING_PATH, toPropertySettingPayload(nextForm, publish));
    },
    [put]
  );

  const runAction = useCallback(
    async (
      action: () => Promise<void>,
      successMessageId: string,
      errorMessageId: string
    ) => {
      setIsBusy(true);

      try {
        await action();
        toggleNotification({
          type: "success",
          message: formatMessage({ id: getTranslation(successMessageId) }),
        });
        await loadSpecials();
      } catch {
        toggleNotification({
          type: "danger",
          message: formatMessage({ id: getTranslation(errorMessageId) }),
        });
      } finally {
        setIsBusy(false);
      }
    },
    [formatMessage, loadSpecials, toggleNotification]
  );

  const handleSave = useCallback(() => {
    return runAction(
      () => persistSetting(formRef.current),
      "specials.save.success",
      "specials.save.error"
    );
  }, [persistSetting, runAction]);

  const handlePublish = useCallback(() => {
    return runAction(
      () => persistSetting(formRef.current, true),
      "specials.publish.success",
      "specials.publish.error"
    );
  }, [persistSetting, runAction]);

  const handleRemoveManual = useCallback(
    async (clientId: string) => {
      const nextForm: PropertySettingForm = {
        ...form,
        additionalTopSpecials: form.additionalTopSpecials.filter(
          (special) => special.clientId !== clientId
        ),
      };

      setForm(nextForm);
      setIsBusy(true);

      try {
        await persistSetting(nextForm, true);
        toggleNotification({
          type: "success",
          message: formatMessage({
            id: getTranslation("specials.delete.success"),
          }),
        });
        await loadSpecials();
      } catch {
        toggleNotification({
          type: "danger",
          message: formatMessage({ id: getTranslation("specials.save.error") }),
        });
        await loadSpecials();
      } finally {
        setIsBusy(false);
      }
    },
    [form, formatMessage, loadSpecials, persistSetting, toggleNotification]
  );

  const addManualSpecial = useCallback(() => {
    setForm((current) => ({
      ...current,
      additionalTopSpecials: [
        ...current.additionalTopSpecials,
        createManualTopSpecial(),
      ],
    }));
  }, []);

  return {
    form,
    setForm,
    isLoading,
    isBusy,
    loadSpecials,
    handleSave,
    handlePublish,
    handleRemoveManual,
    addManualSpecial,
  };
};
