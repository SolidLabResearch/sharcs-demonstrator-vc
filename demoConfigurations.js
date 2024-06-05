import cLessThanPrvPub from './resources/less_than_prv_pub_64.json' assert { type: "json" };
import cLessThanPubPrv from './resources/less_than_pub_prv_64.json' assert { type: "json" };

export const demoConfigurations =
  {
    'example-01': {
      description: 'Less than predicate with private variable on the left and public variable on the right',
      vcRecords: [
        {
          unsigned: './resources/vc2.json',
          disclosed: './resources/disclosed2.json',
        }

      ],
      circuits: {
        [cLessThanPrvPub.id]: cLessThanPrvPub
      },
      predicates: [
        {
          '@context': 'https://zkp-ld.org/context.jsonld',
          type: 'Predicate',
          circuit: 'circ:lessThanPrvPub',
          private: [
            {
              type: 'PrivateVariable',
              var: 'lesser',
              val: '_:Y',
            },
          ],
          public: [
            {
              type: 'PublicVariable',
              var: 'greater',
              val: {
                '@value': '50000',
                '@type': 'xsd:integer',
              },
            },
          ],
        },
      ]
    },
    'example-02-between-valid': {
      description: 'Two predicates to simulate a between predicate: l < x < r',
      vcRecords: [
        {
          unsigned: './resources/vc2.json',
          disclosed: './resources/disclosed2.json',
        }

      ],
      circuits: {
        [cLessThanPrvPub.id]: cLessThanPrvPub,
        [cLessThanPubPrv.id]: cLessThanPubPrv
      },
      predicates: [
        {
          '@context': 'https://zkp-ld.org/context.jsonld',
          type: 'Predicate',
          circuit: 'circ:lessThanPubPrv',
          private: [
            {
              type: 'PrivateVariable',
              var: 'greater',
              val: '_:Y',
            },
          ],
          public: [
            {
              type: 'PublicVariable',
              var: 'lesser',
              val: {
                '@value': '9999',
                '@type': 'xsd:integer',
              },
            },
          ],
        },
        {
          '@context': 'https://zkp-ld.org/context.jsonld',
          type: 'Predicate',
          circuit: 'circ:lessThanPrvPub',
          private: [
            {
              type: 'PrivateVariable',
              var: 'lesser',
              val: '_:Y',
            },
          ],
          public: [
            {
              type: 'PublicVariable',
              var: 'greater',
              val: {
                '@value': '50000',
                '@type': 'xsd:integer',
              },
            },
          ],
        },
      ]
    },
    'example-02-between-invalid': {
      description: 'Two predicates to simulate a between predicate: l < x < r',
      vcRecords: [
        {
          unsigned: './resources/vc2.json',
          disclosed: './resources/disclosed2.json',
        }

      ],
      circuits: {
        [cLessThanPrvPub.id]: cLessThanPrvPub,
        [cLessThanPubPrv.id]: cLessThanPubPrv
      },
      predicates: [
        {
          '@context': 'https://zkp-ld.org/context.jsonld',
          type: 'Predicate',
          circuit: 'circ:lessThanPubPrv',
          private: [
            {
              type: 'PrivateVariable',
              var: 'greater',
              val: '_:Y',
            },
          ],
          public: [
            {
              type: 'PublicVariable',
              var: 'lesser',
              val: {
                '@value': '10001',
                '@type': 'xsd:integer',
              },
            },
          ],
        },
        {
          '@context': 'https://zkp-ld.org/context.jsonld',
          type: 'Predicate',
          circuit: 'circ:lessThanPrvPub',
          private: [
            {
              type: 'PrivateVariable',
              var: 'lesser',
              val: '_:Y',
            },
          ],
          public: [
            {
              type: 'PublicVariable',
              var: 'greater',
              val: {
                '@value': '50000',
                '@type': 'xsd:integer',
              },
            },
          ],
        },
      ]
    }
  }