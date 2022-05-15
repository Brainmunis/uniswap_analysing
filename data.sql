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
    transacted_at TIMESTAMPTZ NOT NULL,
    pool_id INT NOT NULL REFERENCES pools(id)
)
CREATE TABLE indexing_tracker (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    pool_id INT NOT NULL REFERENCES pools(id),
    index_status VARCHAR(50) NOT NULL,
    last_sync_at TIMESTAMPTZ,
    event_type VARCHAR(50) NOT NULL,
    last_block_id int,
    failure_message VARCHAR(1000)
)

