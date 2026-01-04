import styled from "@emotion/styled";
import { useAppSelector } from "../../hooks";
import Location from "./Location";
import { LocationContainer } from "../../shared/locationStyles";

const Container = styled(LocationContainer)`
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 2rem auto 0;
  padding: 0.5em 0;
`;

export default function Locations() {
  const locations = useAppSelector((state) => state.user.recentLocations);

  if (!locations.length) return null;

  return (
    <Container>
      {locations.map((location) => (
        <Location location={location} key={`${location.lat}${location.lon}`} />
      ))}
    </Container>
  );
}
