import { useI18n } from '../../../lib/i18n';
import React from "react";
import { Box, Container, Stack, Tabs } from "@mui/material";
import Typography from "@mui/material/Typography";
import Tab from "@mui/material/Tab";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import "../../../css/help.css";
import { terms } from "../../../lib/data/terms";
import { faq } from "../../../lib/data/faq";

export default function HelpPage() {
  const { t } = useI18n();
  const [value, setValue] = React.useState("1");

  /** HANDLERS **/
  
  const handleChange = (e: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <div className={"help-page"}>
      <Container className={"help-container"}>
        <TabContext value={value}>
          <Box className={"help-menu"}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label={t("Help sections")}
                className={"table_list"} variant="scrollable" scrollButtons="auto"
              >
                <Tab label={t("TERMS")} value={"1"} />
                <Tab label={t("FAQ")} value={"2"} />
                <Tab label={t("CONTACT")} value={"3"} />
              </Tabs>
            </Box>
          </Box>
          <Stack>
            <Stack className={"help-main-content"}>
              <TabPanel value={"1"}>
                <Stack className={"rules-box"}>
                  <Box className={"rules-frame"}>
                    {terms.map(value => <div key={value.title}><h2>{t(value.title)}</h2><p>{t(value.body)}</p></div>)}
                  </Box>
                </Stack>
              </TabPanel>
              <TabPanel value={"2"}>
                <Stack className={"accordion-menu"}>
                  {faq.map((value, number) => {
                    return (
                      <Accordion key={number}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls={`faq-panel-${number}`}
                          id={`faq-heading-${number}`}
                        >
                          <Typography>{t(value.question)}</Typography>
                        </AccordionSummary>
                        <AccordionDetails id={`faq-panel-${number}`} aria-labelledby={`faq-heading-${number}`}>
                          <Typography>{t(value.answer)}</Typography>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Stack>
              </TabPanel>
              <TabPanel value={"3"}>
                <Box className="th-container"><h2>{t("Contact")}</h2><p>{t("Contact the seller for confirmed product and purchase information.")}</p><a href="mailto:techHomeuz@gmail.com">{t("techHomeuz@gmail.com")}</a></Box>
              </TabPanel>
            </Stack>
          </Stack>
        </TabContext>
      </Container>
    </div>
  );
}
