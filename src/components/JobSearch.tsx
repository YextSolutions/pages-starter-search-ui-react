import * as React from "react";
import {
  SearchBar,
  SpellCheck,
  ResultsCount,
  StandardFacets,
  NumericalFacets,
  VerticalResults,
  Pagination,
} from "@yext/search-ui-react";
import JobCard from "./JobCard";
import { useSearchState, useSearchActions } from "@yext/search-headless-react";

const JobSearch = (): JSX.Element => {
  const mostRecentSearch = useSearchState(
    (state) => state.query.mostRecentSearch
  );
  const resultsCount =
    useSearchState((state) => state.vertical.resultsCount) ?? 0;

  const searchActions = useSearchActions();

  React.useEffect(() => {
    searchActions.executeVerticalQuery();
  }, []);

  return (
    <div className="px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col">
        <h1 className="pb-4 text-center text-3xl font-bold text-red-700">
          Turtlehead Tacos Careers
        </h1>
        <SearchBar placeholder="Search job title, department, or employment type" />
        <SpellCheck
          customCssClasses={{
            link: "text-red-700 underline",
          }}
        />
        <ResultsCount />
        {/* new code starts here... */}
        {resultsCount > 0 && (
          <div className="flex">
            <div className="mr-5 w-56 shrink-0">
              <div className="flex flex-col rounded border bg-zinc-100 p-4 shadow-sm">
                <StandardFacets
                  customCssClasses={{
                    optionInput: "text-red-700 focus:ring-red-700",
                    optionLabel: "text-stone-900",
                  }}
                />
                <NumericalFacets
                  customCssClasses={{
                    optionInput: "text-red-700 focus:ring-red-700",
                    input___valid: "focus:border-gray-600",
                    optionLabel: "text-stone-900",
                  }}
                />
              </div>
            </div>
            <VerticalResults
              CardComponent={JobCard}
              displayAllOnNoResults={false}
            />
          </div>
        )}
        {mostRecentSearch && resultsCount === 0 && (
          <div>
            <p>
              The search
              <span className="mx-1 font-semibold">{mostRecentSearch}</span>
              did not match any jobs.
            </p>
          </div>
        )}
        {/* ...and ends here */}
      </div>
      <Pagination
        customCssClasses={{
          icon: "text-stone-900",
          label: "text-stone-900",
          selectedLabel: "text-red-700 border-red-700 bg-red-100",
        }}
      />
    </div>
  );
};

export default JobSearch;
