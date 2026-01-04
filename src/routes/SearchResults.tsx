import { AxiosError } from "axios";
import Search from "../search/Search";
import styled from "@emotion/styled";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../shared/Loading";
import {
  LocationContainer,
  LocationItemLink,
  LocationLabel,
} from "../shared/locationStyles";
import { useTranslation } from "react-i18next";
import { getTrimmedCoordinates } from "../helpers/coordinates";
import { searchLocations } from "../services/geocode";
import Geocode from "../models/Geocode";

const Page = styled.section`
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const SearchWrapper = styled(Search)`
  margin: 2rem auto 0;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  text-align: center;
`;

const Subtitle = styled.p`
  margin: 0;
  color: var(--softText);
  font-size: 0.95rem;
`;

const ResultsContainer = styled(LocationContainer)`
  width: 100%;
  padding-top: 0;

  @media (max-width: 600px) {
    margin-left: -1rem;
    margin-right: -1rem;
    width: calc(100% + 2rem);
  }
`;

const ResultList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ResultMeta = styled.span`
  font-size: 0.85rem;
  color: var(--softText);
  line-height: 1.2;
`;

const ResultText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  border-top-left-radius: 1em;
  border-top-right-radius: 1em;

  @media (max-width: 600px) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
`;

const FilterInput = styled.input`
  flex: 1;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
  padding: 0.35rem 0;
  background: transparent;
  color: inherit;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-bottom-color: var(--softText);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const FilterMeta = styled.span`
  flex-shrink: 0;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  color: var(--softText);
`;

const FilterTitle = styled.span`
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--softText);
  flex-shrink: 0;
`;

const Message = styled.p`
  color: var(--softText);
  text-align: center;
  margin: 1rem 0;
`;

const CONNECTION_ERROR_MESSAGE =
  "Please check your internet connection and try again.";
const NO_RESULTS_MESSAGE = "Nothing found, please try again.";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const rawQuery = searchParams.get("q") ?? "";
  const query = rawQuery.trim();
  const [results, setResults] = useState<Geocode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    if (!query) {
      navigate("/", { replace: true });
      return;
    }

    let active = true;
    setLoading(true);
    setError("");
    setResults([]);

    searchLocations(query)
      .then((locations) => {
        if (!active) return;
        setResults(locations);
      })
      .catch((e) => {
        if (!active) return;
        if (e instanceof AxiosError) {
          setError(CONNECTION_ERROR_MESSAGE);
        } else {
          setError(NO_RESULTS_MESSAGE);
        }
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query, navigate]);

  useEffect(() => {
    setFilterText("");
  }, [query]);

  const filteredResults = useMemo(() => {
    const normalizedFilter = filterText.trim().toLowerCase();
    if (!normalizedFilter) return results;

    return results.filter((result) =>
      result.label.toLowerCase().includes(normalizedFilter),
    );
  }, [filterText, results]);

  const filterActive = Boolean(filterText.trim());
  const filterSummary =
    results.length > 0
      ? t("{{shown}} of {{total}} shown", {
          shown: filteredResults.length,
          total: results.length,
        })
      : "";

  const resultSubtitle =
    !loading && !error && query
      ? t("Displaying {{count}} results for \"{{query}}\"", {
          count: results.length,
          query,
        })
      : "";

  useEffect(() => {
    if (loading || error || results.length !== 1) return;

    const [singleResult] = results;
    const target = getTrimmedCoordinates(singleResult.lat, singleResult.lon);
    navigate(`/${target}`, { replace: true });
  }, [loading, error, results, navigate]);

  return (
    <Page>
      <SearchWrapper />
      <Header>{resultSubtitle && <Subtitle>{resultSubtitle}</Subtitle>}</Header>

      {loading ? (
        <Loading center={false} />
      ) : error ? (
        <Message>{error}</Message>
      ) : (
        <ResultsContainer>
          {results.length > 0 && (
            <FilterRow>
              <FilterTitle>{t("Filter")}</FilterTitle>
              <FilterInput
                value={filterText}
                onChange={(event) => setFilterText(event.target.value)}
                placeholder={t("Search results")}
              />
              <FilterMeta>{filterSummary}</FilterMeta>
            </FilterRow>
          )}

          {filteredResults.length === 0 ? (
            <Message>
              {filterActive
                ? t("No results match that filter.")
                : t("No locations available for this search.")}
            </Message>
          ) : (
            <ResultList>
              {filteredResults.map((result) => {
                const trimmed = getTrimmedCoordinates(result.lat, result.lon).replace(
                  ",",
                  ", ",
                );

                return (
                  <LocationItemLink
                    key={`${result.lat}-${result.lon}`}
                    to={`/${getTrimmedCoordinates(result.lat, result.lon)}`}
                  >
                    <ResultText>
                      <LocationLabel>{result.label}</LocationLabel>
                      <ResultMeta>{trimmed}</ResultMeta>
                    </ResultText>
                  </LocationItemLink>
                );
              })}
            </ResultList>
          )}
        </ResultsContainer>
      )}
    </Page>
  );
}
