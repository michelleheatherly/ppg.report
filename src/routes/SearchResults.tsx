import { AxiosError } from "axios";
import Search from "../search/Search";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Loading from "../shared/Loading";
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

const ResultsContainer = styled.div`
  width: 100%;
  background-color: rgba(211, 211, 211, 0.043);
  border-radius: 1em;
  box-shadow: 0 0.25em 0.5em rgba(0, 0, 0, 0.7);
  padding: 0.5rem 0;
  backdrop-filter: blur(5px);

  @media (max-width: 600px) {
    border-radius: 0;
    margin-left: -1rem;
    margin-right: -1rem;
    width: calc(100% + 2rem);
  }
`;

const ResultList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ResultLabel = styled.span`
  transition: transform 100ms ease-out;
  transform-origin: left center;
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

const ResultLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 2em;
  min-height: 4rem;
  transition: background-color 100ms ease-out;

  color: inherit;
  text-decoration: none !important;

  &:hover,
  &:focus,
  &:focus-visible {
    background-color: rgba(0, 0, 0, 0.1);

    ${ResultLabel} {
      transform: scale(1.015);
      font-weight: 500;
    }
  }
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
          <ResultList>
            {results.map((result) => {
              const trimmed = getTrimmedCoordinates(result.lat, result.lon).replace(
                ",",
                ", ",
              );

              return (
                <ResultLink
                  key={`${result.lat}-${result.lon}`}
                  to={`/${getTrimmedCoordinates(result.lat, result.lon)}`}
                >
                  <ResultText>
                    <ResultLabel>{result.label}</ResultLabel>
                    <ResultMeta>{trimmed}</ResultMeta>
                  </ResultText>
                </ResultLink>
              );
            })}
          </ResultList>
        </ResultsContainer>
      )}
    </Page>
  );
}
