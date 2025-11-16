import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const censusData = [
  {
    "State": "California",
    "2020": 39538223,
    "2010": 37253956
  },
  {
    "State": "Texas",
    "2020": 29145505,
    "2010": 25145561
  },
  {
    "State": "Florida",
    "2020": 21538187,
    "2010": 18801310
  },
  {
    "State": "New York",
    "2020": 20201249,
    "2010": 19378102
  },
  {
    "State": "Pennsylvania",
    "2020": 13002700,
    "2010": 12702379
  },
  {
    "State": "Illinois",
    "2020": 12812508,
    "2010": 12830632
  },
  {
    "State": "Ohio",
    "2020": 11799448,
    "2010": 11536504
  },
  {
    "State": "Georgia",
    "2020": 10711908,
    "2010": 9687653
  },
  {
    "State": "North Carolina",
    "2020": 10439388,
    "2010": 9535483
  },
  {
    "State": "Michigan",
    "2020": 10077331,
    "2010": 9883640
  },
  {
    "State": "New Jersey",
    "2020": 9288994,
    "2010": 8791894
  },
  {
    "State": "Virginia",
    "2020": 8631393,
    "2010": 8001024
  },
  {
    "State": "Washington",
    "2020": 7705281,
    "2010": 6724540
  },
  {
    "State": "Arizona",
    "2020": 7151502,
    "2010": 6392017
  },
  {
    "State": "Massachusetts",
    "2020": 7029917,
    "2010": 6547629
  },
  {
    "State": "Tennessee",
    "2020": 6910840,
    "2010": 6346105
  },
  {
    "State": "Indiana",
    "2020": 6785528,
    "2010": 6483802
  },
  {
    "State": "Maryland",
    "2020": 6177224,
    "2010": 5773552
  },
  {
    "State": "Missouri",
    "2020": 6154913,
    "2010": 5988927
  },
  {
    "State": "Wisconsin",
    "2020": 5893718,
    "2010": 5686986
  },
  {
    "State": "Colorado",
    "2020": 5773714,
    "2010": 5029196
  },
  {
    "State": "Minnesota",
    "2020": 5706494,
    "2010": 5303925
  },
  {
    "State": "South Carolina",
    "2020": 5118425,
    "2010": 4625364
  },
  {
    "State": "Alabama",
    "2020": 5024279,
    "2010": 4779736
  },
  {
    "State": "Louisiana",
    "2020": 4657757,
    "2010": 4533372
  },
  {
    "State": "Kentucky",
    "2020": 4505836,
    "2010": 4339367
  },
  {
    "State": "Oregon",
    "2020": 4237256,
    "2010": 3831074
  },
  {
    "State": "Oklahoma",
    "2020": 3959353,
    "2010": 3751351
  },
  {
    "State": "Connecticut",
    "2020": 3605944,
    "2010": 3574097
  },
  {
    "State": "Utah",
    "2020": 3271616,
    "2010": 2763885
  },
  {
    "State": "Iowa",
    "2020": 3190369,
    "2010": 3046355
  },
  {
    "State": "Nevada",
    "2020": 3104614,
    "2010": 2700551
  },
  {
    "State": "Arkansas",
    "2020": 3011524,
    "2010": 2915918
  },
  {
    "State": "Mississippi",
    "2020": 2961279,
    "2010": 2967297
  },
  {
    "State": "Kansas",
    "2020": 2937880,
    "2010": 2853118
  },
  {
    "State": "New Mexico",
    "2020": 2117522,
    "2010": 2059179
  },
  {
    "State": "Nebraska",
    "2020": 1961504,
    "2010": 1826341
  },
  {
    "State": "Idaho",
    "2020": 1839106,
    "2010": 1567582
  },
  {
    "State": "West Virginia",
    "2020": 1793716,
    "2010": 1852994
  },
  {
    "State": "Hawaii",
    "2020": 1455271,
    "2010": 1360301
  },
  {
    "State": "New Hampshire",
    "2020": 1377529,
    "2010": 1316470
  },
  {
    "State": "Maine",
    "2020": 1362359,
    "2010": 1328361
  },
  {
    "State": "Rhode Island",
    "2020": 1097379,
    "2010": 1052567
  },
  {
    "State": "Montana",
    "2020": 1084225,
    "2010": 989415
  },
  {
    "State": "Delaware",
    "2020": 989948,
    "2010": 897934
  },
  {
    "State": "South Dakota",
    "2020": 886667,
    "2010": 814180
  },
  {
    "State": "North Dakota",
    "2020": 779094,
    "2010": 672591
  },
  {
    "State": "Alaska",
    "2020": 733391,
    "2010": 710231
  },
  {
    "State": "District of Columbia",
    "2020": 689545,
    "2010": 601723
  },
  {
    "State": "Vermont",
    "2020": 643077,
    "2010": 625741
  },
  {
    "State": "Wyoming",
    "2020": 576851,
    "2010": 563626
  }
]

async function main() {
  await prisma.$transaction(async (tx) => {
		const censuses = await tx.census.findMany({
			where: {
				year: {
					in: [2020, 2010]
				}
			}
		})

    await tx.congressionalSession.update({
      where: {
        slug: "2012"
      },
      data: {
        censusId: censuses.find(c => c.year === 2010)?.id,
      },
    })
    await tx.congressionalSession.update({
      where: {
        slug: "2024"
      },
      data: {
        censusId: censuses.find(c => c.year === 2020)?.id,
      },
    })

    for (const data of censusData) {
      const state = await tx.state.findFirst({
          where: {
            name: data.State
          }
        })
        if (state === null) {
          console.warn(`State not found: ${data.State}`)
          return;
        }
        await tx.stateCensus.create({
          data: {
            stateId: state.id,
            population: data["2020"],
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            censusId: censuses.find(c => c.year === 2020)?.id!,
          }
        })
      await tx.stateCensus.create({
        data: {
          stateId: state.id,
          population: data["2010"],
          // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
          censusId: censuses.find(c => c.year === 2010)?.id!,
        }
      })
    }
  },{
    maxWait: 5000,
    timeout: 10000,
  } )
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())