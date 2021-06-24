CREATE OR REPLACE MATERIALIZED VIEW card_summary AS
    (
        SELECT
            card.id,
            card.name,
            card.description,
            CASE
                WHEN attachment.dirname IS NULL THEN NULL
                ELSE CONCAT(attachment.dirname, '/', attachment.filename)
            END AS filepath,
            public.list.name AS list_name,
            jsonb_agg(label.name) FILTER (WHERE label.name IS NOT NULL) AS labels
        FROM
            card
            LEFT JOIN attachment ON
                    card.cover_attachment_id = attachment.id
            LEFT JOIN card_label ON
                    card_label.card_id = card.id
            LEFT JOIN label ON
                    label.id = card_label.label_id
            JOIN public.list ON
                    card.list_id = public.list.id
        GROUP BY
            card.id,
            card.name,
            card.description,
            attachment.dirname,
            attachment.filename,
            public.list.name
    );
