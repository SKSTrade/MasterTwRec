# Master Trade System V1.30.29
## Structural Gap Full Audit

### Confirmed calculation model

Structural Gap **Off**:

> Main Judge = Main-TF Main Market State  
> Secondary Judge = Secondary-TF Main Market State

Structural Gap **On**:

> Main Judge = Main-TF Main Market State  
> Secondary Judge = Secondary-TF Working Market State

Main never switches to Working. Structural Gap exists only on the Secondary Judge source.

### Audit result

- Gap Off exhaustively matched V1.30.27 legacy calculation across 3,528 state / direction / T0 combinations.
- Gap On matched direct `Main + Secondary Working` routing across 2,744 combinations.
- Matrix tables, P/Q sizing, T0 rules, Obstacle/RR and setup constraints remain byte-identical.
- Fixed a display-only issue: history cards previously showed Secondary Main even when Gap On; they now show the actual Secondary Judge State and `[Main]` / `[Working]` source.
- UI wording standardized to `Main / Working` instead of `Official / Working` to match the structural model.

### CSV / compatibility

CSV remains 177 columns. Old V1.30.28 records/CSV remain compatible. Gap Off records use Secondary Main; Gap On records use Secondary Working.

### Unchanged

- V1.3 Matrix values
- T0-Balance / T0-Post-Break
- P / E / Native Q
- Obstacle / RR
- XAU-B Mon H/L fix
- FX-B Warning parity
- FX-C behavior
- V1.4 remains disabled
