CREATE TABLE pools (
    id BIGSERIAL NOT NULL UNIQUE,
    contract_address VARCHAR(100) NOT NULL PRIMARY KEY,
    label VARCHAR(50) NOT NULL,
    token0 VARCHAR(50) NOT NULL,
    token1 VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

CREATE TABLE pool_activity (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    block_no int NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    owner_address VARCHAR(100) NOT NULL,
    transaction_hash VARCHAR(100) NOT NULL,
    total_value VARCHAR(100) NOT NULL,
    token_amount0 VARCHAR(100) NOT NULL,
    token_amount1 VARCHAR(100) NOT NULL,
    contract_address VARCHAR(100) NOT NULL REFERENCES pools(contract_address),
    transacted_at TIMESTAMPTZ NOT NULL
)

INSERT INTO pool_activity (block_no,event_type,owner_address,transaction_hash,total_value,token_amount0,token_amount1,contract_address,transacted_at) VALUES 
('14779259', 'Mint', '0x50379f632ca68D36E50cfBC8F78fe16bd1499d1e', '0x485fa6559504769836bc0bceb489dacde1502b16822af15aa687d23637036923', '1665758073033551052492072', '166075503462945537223097098', '167042800732178', '0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168', '2022-05-15 09:49:39.000+00'), ('14779259', 'Mint', '0x50379f632ca68D36E50cfBC8F…8D36E50cfBC8F78fe16bd1499d1e', '0xdc15cb9000824eaa450f516fc1d686c1658527d1420ae9099e1dfe59bb0ca6b2', '1666089586261381600787540', '163097359191353574518486880', '170087256171207', '0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168', '2022-05-15 11:24:54.000+00'), ('14779685', 'Mint', '0x50379f632ca68D36E50cfBC8F78fe16bd1499d1e', '0xdc15cb9000824eaa450f516fc1d686c1658527d1420ae9099e1dfe59bb0ca6b2', '8546144', '836601783', '1', '0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168', '2022-05-15 11:24:54.000+00')

