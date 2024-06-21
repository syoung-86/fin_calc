import FutureValueChart from "@/components/futureValueChart";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import React, { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/futureValueTable";
import { ColumnDef } from "@tanstack/react-table";

export type Row = {
  id: number;
  value: number;
  annualContribution: number;
};

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
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
  const [initialInvestment, setInitialInvestment] = useState(1000000);
  const [annualGrowthRate, setAnnualGrowthRate] = useState(0.12);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [annualContributionIncrease, setAnnualContributionIncrease] =
    useState(0.06);
  const [period, setPeriod] = useState(30);
  const [futureValues, setFutureValues] = useState<
    { year: number; value: number; monthlyContribution: number }[]
  >([]);

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
      <div style={{ display: "flex", gap: "20px" }}>
        <div
          style={{
            marginLeft: "50px",
            marginTop: "50px",
            marginRight: "-500px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            minWidth: "300px",
          }}>
          <div>
            <label htmlFor="initial-investment">Initial Investment:</label>
            <Slider
              id="initial-investment"
              defaultValue={[initialInvestment]}
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
              defaultValue={[annualGrowthRate]}
              max={0.3}
              step={0.01}
              onValueChange={value => setAnnualGrowthRate(value[0])}
            />
            <span>{`${(annualGrowthRate * 100).toFixed(2)}%`}</span>
          </div>
          <div>
            <label htmlFor="monthlyContribution">Monthly Contribution:</label>
            <Slider
              id="monthlyContribution"
              defaultValue={[monthlyContribution]}
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
              defaultValue={[annualContributionIncrease]}
              max={0.3}
              step={0.01}
              onValueChange={value => setAnnualContributionIncrease(value[0])}
            />
            <span>{`${(annualContributionIncrease * 100).toFixed(2)}%`}</span>
          </div>
          <div>
            <label htmlFor="years">Years:</label>
            <Slider
              id="years"
              defaultValue={[period]}
              max={50}
              step={1}
              onValueChange={value => setPeriod(value[0])}
            />
            <span>{`${period} years`}</span>
          </div>
        </div>
        <FutureValueChart data={futureValues} />
      </div>

      <div
        style={{
          minHeight: "500px",
          width: "80%",
          marginLeft: "50px",
          marginTop: "50px",
        }}>
        <DataTable columns={columns} data={data.sort((a, b) => b.id - a.id)} />
      </div>
    </>
  );
};

export default InvestmentCalculator;
