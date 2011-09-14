#drones {
  marker-allow-overlap: true;
  marker-width: 2;
  marker-height: 2;
  marker-line-width: 1;
  marker-line-opacity: 0.2;
  marker-type: ellipse;
  marker-meta-writer: "meta1";
  marker-meta-output: "assumed_target, description, date, year, location";

  [year>=2009] {
    marker-fill: rgba(240,232,40,.75);
    marker-line-color: rgba(240,232,40,.25);
  }

  [year<=2008] {
    marker-fill: rgba(240,96,40,.75);
    marker-line-color: rgba(240,96,40,.25);
  }

  [deaths_min>=5][deaths_min<10] {
    [zoom=6] { marker-width: 1;     marker-height: 1; }
    [zoom=7] { marker-width: 1*1.5; marker-height: 1*1.5; }
    [zoom=8] { marker-width: 1*3;   marker-height: 1*3; }
    [zoom=9] { marker-width: 1*6;   marker-height: 1*6; }
  }

  [deaths_min>=10][deaths_min<20] {
    [zoom=6] { marker-width: 2;     marker-height: 2; }
    [zoom=7] { marker-width: 2*1.5; marker-height: 2*1.5; }
    [zoom=8] { marker-width: 2*3;   marker-height: 2*3; }
    [zoom=9] { marker-width: 2*6;   marker-height: 2*6; }
  }

  [deaths_min>=20][deaths_min<30] {
    [zoom=6] { marker-width: 3;     marker-height: 3; }
    [zoom=7] { marker-width: 3*1.5; marker-height: 3*1.5; }
    [zoom=8] { marker-width: 3*3;   marker-height: 3*3; }
    [zoom=9] { marker-width: 3*6;   marker-height: 3*6; }
  }

  [deaths_min>=30] {
    [zoom=6] { marker-width: 4;     marker-height: 4; }
    [zoom=7] { marker-width: 4*1.5; marker-height: 4*1.5; }
    [zoom=8] { marker-width: 4*3;   marker-height: 4*3; }
    [zoom=9] { marker-width: 4*6;   marker-height: 4*6; }
  }
}

