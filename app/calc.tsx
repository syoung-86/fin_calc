import FutureValueChart from "@/components/futureValueChart";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import React, { useEffect, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { SavedCalculationsTable } from "@/components/savedCalculationsTable";
import { DataTable } from "@/components/futureValueTable";

export type Row = {
  id: number;
  value: number;
  annualContribution: number;
};

export type SavedRow = {
  id: string;
  initialInvestment: string;
  annualGrowthRate: string;
  monthlyContribution: string;
  annualContributionIncrease: string;
  total: string;
};

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export const savedColumns: ColumnDef<SavedRow>[] = [
  {
    accessorKey: "total",
    header: "Total",
    cell: value => {
      return (
        <div className="min-w-[120px] p-2 text-right">
          {value.getValue() as string}
        </div>
      );
    },
  },
  {
    accessorKey: "initialInvestment",
    header: "Initial Investment",
    cell: value => {
      return (
        <div className="min-w-[120px] p-2 text-right">
          {value.getValue() as string}
        </div>
      );
    },
  },
  {
    accessorKey: "monthlyContribution",
    header: "Monthly Contribution",
  },
  {
    accessorKey: "annualGrowthRate",
    header: "Annual Growth Rate",
  },
  {
    accessorKey: "annualContributionIncrease",
    header: "Annual Contribution Increase",
  },
  {
    accessorKey: "id",
    header: "Year",
  },
];
export const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "id",
    header: "Year",
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: info => {
      const roundedValue = info.getValue() as number;

      return ` R ${formatNumber(Math.round(roundedValue))}`;
    },
  },
  {
    accessorKey: "annualContribution",
    header: "Annual Contribution",
    cell: info => {
      const roundedValue = info.getValue() as number;

      return ` R ${formatNumber(Math.round(roundedValue))}`;
    },
  },
];
function calculateFutureValue(
  initialInvestment: number,
  annualGrowthRate: number,
  monthlyContribution: number,
  annualContributionIncrease: number,
  years: number,
): { totalFutureValue: number; currentAnnualContribution: number } {
  const monthlyGrowthRate = (1 + annualGrowthRate) ** (1 / 12) - 1;
  let totalFutureValue = initialInvestment * (1 + annualGrowthRate) ** years;

  let currentAnnualContribution = 0;
  for (let year = 0; year < years; year++) {
    currentAnnualContribution =
      monthlyContribution * 12 * (1 + annualContributionIncrease) ** year;

    for (let month = 0; month < 12; month++) {
      const monthsInFuture = (years - year - 1) * 12 + (12 - month);
      const futureValueOfContribution =
        (currentAnnualContribution / 12) *
        (1 + monthlyGrowthRate) ** monthsInFuture;
      totalFutureValue += futureValueOfContribution;
    }
  }

  return { totalFutureValue, currentAnnualContribution };
}
const InvestmentCalculator: React.FC = () => {
  const [data, setData] = useState<
    { id: number; value: number; annualContribution: number }[]
  >([]);
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [annualGrowthRate, setAnnualGrowthRate] = useState(0.09);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [annualContributionIncrease, setAnnualContributionIncrease] =
    useState(0.1);
  const [period, setPeriod] = useState(10);
  const [futureValues, setFutureValues] = useState<
    { year: number; value: number; monthlyContribution: number }[]
  >([]);
  const [savedInputs, setSavedInputs] = useState<SavedRow[]>([]);

  const handleCalculate = () => {
    const values: {
      year: number;
      value: number;
      monthlyContribution: number;
    }[] = [];
    const rows: Row[] = [];
    for (let i = 0; i <= period; i++) {
      const {
        totalFutureValue: result,
        currentAnnualContribution: annualContribution,
      } = calculateFutureValue(
        initialInvestment,
        annualGrowthRate,
        monthlyContribution,
        annualContributionIncrease,
        i,
      );
      values.push({
        year: period,
        value: result,
        monthlyContribution: monthlyContribution,
      });
      rows.push({
        id: i,
        value: result,
        annualContribution: annualContribution,
      });
    }
    setData(rows);
    setFutureValues(values);
  };
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const reset = () => {
    setInitialInvestment(100000);
    setAnnualGrowthRate(0.09);
    setMonthlyContribution(0);
    setAnnualContributionIncrease(0.1);
    setPeriod(10);
    setSavedInputs([]);
  };
  const save = () => {
    const newSavedInputs = [...savedInputs];
    const total = Math.round(data[0].value);
    const newRow: SavedRow = {
      id: `${period} years`,
      initialInvestment: `R ${formatNumber(initialInvestment)}`,
      monthlyContribution: `R ${formatNumber(monthlyContribution)}`,
      annualGrowthRate: `${annualGrowthRate * 100} %`,
      annualContributionIncrease: `${annualContributionIncrease * 100} %`,
      total: `R ${formatNumber(total)}`,
    };
    newSavedInputs.push(newRow);
    setSavedInputs(newSavedInputs);
  };

  useEffect(() => {
    console.log("savedInputs: ", savedInputs);
  }, [savedInputs]);
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleCalculate();
    }, 100);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    initialInvestment,
    annualGrowthRate,
    monthlyContribution,
    annualContributionIncrease,
    period,
  ]);
  return (
    <>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-1 p-4">
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="initial-investment">Initial Investment:</label>
                <Slider
                  id="initial-investment"
                  value={[initialInvestment]}
                  max={5000000}
                  step={100000}
                  onValueChange={value => setInitialInvestment(value[0])}
                />
                <span>{`R ${formatNumber(initialInvestment)}`}</span>
              </div>
              <div>
                <label htmlFor="annualGrowthRate">Annual Growth Rate:</label>
                <Slider
                  id="annualGrowthRate"
                  value={[annualGrowthRate]}
                  max={0.3}
                  step={0.01}
                  onValueChange={value => setAnnualGrowthRate(value[0])}
                />
                <span>{`${(annualGrowthRate * 100).toFixed(2)}%`}</span>
              </div>
              <div>
                <label htmlFor="monthlyContribution">
                  Monthly Contribution:
                </label>
                <Slider
                  id="monthlyContribution"
                  value={[monthlyContribution]}
                  max={100000}
                  step={1000}
                  onValueChange={value => setMonthlyContribution(value[0])}
                />
                <span>{`R ${formatNumber(monthlyContribution)}`}</span>
              </div>
              <div>
                <label htmlFor="annualContributionIncrease">
                  Annual Contribution Increase:
                </label>
                <Slider
                  id="annualContributionIncrease"
                  value={[annualContributionIncrease]}
                  max={0.3}
                  step={0.01}
                  onValueChange={value =>
                    setAnnualContributionIncrease(value[0])
                  }
                />
                <span>{`${(annualContributionIncrease * 100).toFixed(2)}%`}</span>
              </div>
              <div>
                <label htmlFor="years">Years:</label>
                <Slider
                  id="years"
                  value={[period]}
                  max={50}
                  step={1}
                  onValueChange={value => setPeriod(value[0])}
                />
                <span>{`${period} years`}</span>
              </div>
              <Button onClick={save}>Save</Button>
              <Button onClick={reset}>Reset</Button>
            </div>
          </div>
          <div className="col-span-1 md:col-span-2 p-4">
            <FutureValueChart data={futureValues} />
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 p-4">
          <SavedCalculationsTable columns={savedColumns} data={savedInputs} />
        </div>
        <div className="mt-8">
          <DataTable
            columns={columns}
            data={data.sort((a, b) => b.id - a.id)}
          />
        </div>
      </div>
    </>
  );
};

export default InvestmentCalculator;
